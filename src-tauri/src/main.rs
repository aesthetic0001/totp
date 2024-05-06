// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod password_encryption;

use std::collections::HashMap;
use std::sync::RwLock;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};

fn get_save_dir() -> std::path::PathBuf {
    let save_dir = dirs::home_dir().unwrap().join(".totp");
    if !save_dir.exists() {
        println!("Creating directory {:?}!", save_dir);
        std::fs::create_dir_all(&save_dir).unwrap();
    }
    save_dir
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct TotpEntry {
    secret: String,
    digits: u8,
    period: u8,
    id: u64,
    title: String,
    favourite: bool
}

trait TotpHotp {
    fn get_hotp(&self, counter: u64) -> String;
    fn get_totp(&self) -> String;
}

impl TotpHotp for TotpEntry {
    fn get_hotp(&self, counter: u64) -> String {
        let secret = base32::decode(base32::Alphabet::RFC4648 { padding: false }, &self.secret).unwrap();
        let mut counter_bytes = [0; 8];
        counter_bytes.copy_from_slice(&counter.to_be_bytes());

        let hmac = hmac_sha1::hmac_sha1(&secret, &counter_bytes);
        let offset = (hmac[hmac.len() - 1] & 0xf) as usize;

        let code = ((u32::from(hmac[offset]) & 0x7f) << 24
            | (u32::from(hmac[offset + 1]) & 0xff) << 16
            | (u32::from(hmac[offset + 2]) & 0xff) << 8
            | (u32::from(hmac[offset + 3]) & 0xff))
            % 10u32.pow(u32::from(self.digits));
        format!("{:01$}", code, self.digits as usize)
    }
    fn get_totp(&self) -> String {
        self.get_hotp((chrono::Utc::now().timestamp() as u64) / self.period as u64)
    }
}

lazy_static! {
    static ref ACCOUNTS: RwLock<HashMap<u64, TotpEntry >> = {
        let save_path = get_save_dir().join("2fa.json");
        let saved = std::fs::read_to_string(&save_path).unwrap_or_default();
        RwLock::new(serde_json::from_str(&saved).unwrap_or_default())
    };
}

#[tauri::command]
fn get_saved_totp() -> Result<String, String> {
    let accounts = ACCOUNTS.read().unwrap();
    Ok(serde_json::to_string(&*accounts).unwrap())
}

#[tauri::command]
fn remove_account(id: u64) -> Result<(), String> {
    println!("Removing account with id: {}", id);
    let mut accounts = ACCOUNTS.write().unwrap();
    accounts.remove(&id);
    let save_path = get_save_dir().join("2fa.json");
    std::fs::write(&save_path, serde_json::to_string(&*accounts).unwrap()).unwrap();
    Ok(())
}

#[tauri::command]
fn add_account(title: &str, secret: &str, digits: u8, period: u8) -> Result<(), String> {
    let id = chrono::Utc::now().timestamp_micros() as u64;
    println!("Adding account with id: {}", id);
    let mut accounts = ACCOUNTS.write().unwrap();
    accounts.insert(id, TotpEntry { secret: secret.to_string(), digits, period, id, title: title.to_string(), favourite: false });
    let save_path = get_save_dir().join("2fa.json");
    std::fs::write(&save_path, serde_json::to_string(&*accounts).unwrap()).unwrap();
    Ok(())
}

#[tauri::command]
fn set_favourite(id: u64, favourite: bool) -> Result<(), String> {
    println!("Modifying favourites for account with id: {}", id);
    let mut accounts = ACCOUNTS.write().unwrap();
    if let Some(account) = accounts.get_mut(&id) {
        account.favourite = favourite;
    }
    let save_path = get_save_dir().join("2fa.json");
    std::fs::write(&save_path, serde_json::to_string(&*accounts).unwrap()).unwrap();
    Ok(())
}

#[tauri::command]
fn retrieve_code(id: u64) -> Result<String, ()> {
    println!("Retrieving code for account with id: {}", id);
    let accounts = ACCOUNTS.read().unwrap();
    let account = accounts.get(&id).unwrap();
    Ok(account.get_totp())
}

#[tauri::command]
fn is_encrypted() -> bool {
    password_encryption::is_encrypted()
}

fn parse_otpauth(url: &str) -> Result<(u64, TotpEntry), String> {
    let uri = url::Url::parse(&url).unwrap();
    let mode = uri.host_str().unwrap();
    assert_eq!(mode, "totp");
    let name = uri.path();
    let secret = match uri.query_pairs().find(|(k, _)| k == "secret") {
        Some((_, v)) => v.to_string(),
        None => {
            println!("No secret found!");
            return Err("No secret found!".to_string());
        }
    };
    let digits = match uri.query_pairs().find(|(k, _)| k == "digits") {
        Some((_, v)) => v.parse::<u8>().unwrap(),
        None => 6u8
    };
    let period = match uri.query_pairs().find(|(k, _)| k == "period") {
        Some((_, v)) => v.parse::<u8>().unwrap(),
        None => 30u8
    };
    let chars = name.chars().collect::<Vec<char>>();
    let name = chars[1..].iter().collect::<String>();
    // make sure that name gets rid of the url encoded characters
    let name = urlencoding::decode(&name).unwrap();
    let id = chrono::Utc::now().timestamp_micros() as u64;
    Ok((id, TotpEntry { secret, digits, period, id, title: name.parse().unwrap(), favourite: false }))
}

#[tauri::command]
fn add_from_clipboard(clipboard: &str) -> i64 {
    let lines = clipboard.lines();
    let mut accounts = ACCOUNTS.write().unwrap();
    let mut ctr = 0;

    for line in lines {
        if line.starts_with("otpauth://") {
            let parsed = parse_otpauth(line);
            if parsed.is_err() {
                eprintln!("Error parsing otpauth uri: {}", line);
                continue;
            }
            let (id, entry) = parsed.unwrap();
            if accounts.contains_key(&id) {
                eprintln!("Weird! Account for id {} already exists!", id);
                continue;
            }
            accounts.insert(id, entry);
            ctr += 1;
        }
    }
    
    let save_path = get_save_dir().join("2fa.json");
    std::fs::write(&save_path, serde_json::to_string(&*accounts).unwrap()).unwrap();

    return ctr;
}

#[tauri::command]
fn set_name(id: u64, new_name: &str) -> Result<(), String> {
    println!("Editing name for account with id: {}", id);
    let mut accounts = ACCOUNTS.write().unwrap();
    if let Some(account) = accounts.get_mut(&id) {
        account.title = new_name.to_string();
    }
    let save_path = get_save_dir().join("2fa.json");
    std::fs::write(&save_path, serde_json::to_string(&*accounts).unwrap()).unwrap();
    Ok(())
}

fn main() {
    println!("Starting Tauri application!");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_saved_totp, remove_account, add_account, set_favourite, retrieve_code, add_from_clipboard, set_name, is_encrypted])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
