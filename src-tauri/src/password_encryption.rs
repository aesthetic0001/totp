use std::sync::RwLock;
use aes_gcm::{AeadCore, Aes256Gcm, Key, KeyInit, Nonce};
use aes_gcm::aead::{Aead, OsRng};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use crate::get_save_dir;

#[derive(Default, Serialize, Deserialize)]
struct EncryptionStatus {
    encrypted: bool,
    iv: String,
}

struct EncryptionResult {
    data: String,
    iv: String
}

lazy_static! {
static ref ENCRYPTION_STATUS: RwLock<EncryptionStatus> = {
        let save_path = get_save_dir().join("encryption_status.json");
        let saved = std::fs::read_to_string(&save_path).unwrap_or_default();
        RwLock::new(serde_json::from_str(&saved).unwrap_or_default())
    };
    static ref CIPHER: RwLock<Option<Aes256Gcm>> = {
        RwLock::new(None)
    };
}

pub(crate) fn is_encrypted() -> bool {
    ENCRYPTION_STATUS.read().unwrap().encrypted
}

fn try_decrypt(data: &str) -> Result<String, String> {
    if !is_encrypted() || CIPHER.read().unwrap().is_none() {
        return Ok(data.to_string());
    }

    let status = ENCRYPTION_STATUS.read().unwrap();
    let iv = hex::decode(&status.iv).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(&iv);
    let cipher = CIPHER.read().unwrap();
    let cipher = cipher.as_ref().ok_or("Cipher not initialized".to_string())?;
    let decrypted = cipher.decrypt(nonce, data.as_bytes()).map_err(|e| e.to_string())?;
    let decrypted = String::from_utf8(decrypted).map_err(|e| e.to_string())?;

    Ok(decrypted)
}

fn encrypt(data: &str) -> Result<EncryptionResult, String> {
    if !is_encrypted() || CIPHER.read().unwrap().is_none() {
        return Err("Encryption not enabled".to_string());
    }

    let cipher = CIPHER.read().unwrap();
    let cipher = cipher.as_ref().ok_or("Cipher not initialized".to_string())?;
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let encrypted = cipher.encrypt(&nonce, data.as_bytes()).map_err(|e| e.to_string())?;
    let encrypted = hex::encode(encrypted);
    let iv = hex::encode(nonce.as_slice());

    Ok(EncryptionResult {
        data: encrypted,
        iv
    })
}


fn new_cipher(password: &str) -> Result<Aes256Gcm, String> {
    let password = password.as_bytes();
    if password.len() != 32 {
        return Err("Password must be at least 32 bytes long".to_string());
    }

    let key = Key::<Aes256Gcm>::from_slice(&password);
    let cipher = Aes256Gcm::new(key);

    Ok(cipher)
}

fn enable_encryption(password: &str) -> Result<(), String> {
    let cipher = new_cipher(password)?;

    CIPHER.write().unwrap().replace(cipher);
    ENCRYPTION_STATUS.write().unwrap().encrypted = true;

    return Ok(());
}

fn disable_encryption() {
    CIPHER.write().unwrap().take();
    ENCRYPTION_STATUS.write().unwrap().encrypted = false;
}