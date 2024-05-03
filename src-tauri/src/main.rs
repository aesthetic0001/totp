// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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
fn add_account(title: String, secret: String, digits: u8, period: u8) -> Result<(), String> {
    let id = chrono::Utc::now().timestamp_micros() as u64;
    println!("Adding account with id: {}", id);
    let mut accounts = ACCOUNTS.write().unwrap();
    accounts.insert(id, TotpEntry { secret, digits, period, id, title, favourite: false });
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

fn main() {
    println!("Starting Tauri application!");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_saved_totp, remove_account, add_account, set_favourite, retrieve_code])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
