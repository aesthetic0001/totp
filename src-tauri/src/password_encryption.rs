use std::sync::RwLock;
use aes_gcm::{AeadCore, Aes256Gcm, Key, KeyInit, Nonce};
use aes_gcm::aead::{Aead, OsRng};
use aes_gcm::aead::consts::U12;
use aes_gcm::aead::rand_core::RngCore;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use crate::get_save_dir;

#[derive(Default, Serialize, Deserialize)]
struct EncryptionStatus {
    encrypted: bool,
    iv: String,
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
    // nonce is initialized as 
    static ref NONCE: RwLock<Nonce<U12>> = {
        let status = ENCRYPTION_STATUS.read().unwrap();
        let iv = hex::decode(&status.iv).unwrap_or_else(|_| {
            let mut iv = [0u8; 12];
            OsRng.fill_bytes(&mut iv);
            let save_path = get_save_dir().join("encryption_status.json");
            let status = EncryptionStatus {
                encrypted: false,
                iv: hex::encode(&iv)
            };
            std::fs::write(&save_path, serde_json::to_string(&status).unwrap()).unwrap();
            iv.to_vec()
        });
        RwLock::new(*Nonce::from_slice(&iv))
    };
}

pub(crate) fn is_encrypted() -> bool {
    ENCRYPTION_STATUS.read().unwrap().encrypted
}

fn try_decrypt(data: &str) -> Result<String, String> {
    if !is_encrypted() || CIPHER.read().unwrap().is_none() {
        return Ok(data.to_string());
    }

    let nonce = NONCE.read().unwrap();
    let cipher = CIPHER.read().unwrap();
    let cipher = cipher.as_ref().ok_or("Cipher not initialized".to_string())?;
    let decrypted = cipher.decrypt(&nonce, data.as_bytes()).map_err(|e| e.to_string())?;
    let decrypted = String::from_utf8(decrypted).map_err(|e| e.to_string())?;

    Ok(decrypted)
}

fn encrypt(data: &str) -> Result<String, String> {
    if !is_encrypted() || CIPHER.read().unwrap().is_none() {
        return Err("Encryption not enabled".to_string());
    }

    let cipher = CIPHER.read().unwrap();
    let cipher = cipher.as_ref().ok_or("Cipher not initialized".to_string())?;
    let nonce = NONCE.read().unwrap();
    let encrypted = cipher.encrypt(&nonce, data.as_bytes()).map_err(|e| e.to_string())?;
    let encrypted = hex::encode(encrypted);
    
    Ok(encrypted)
}


pub(crate)fn new_cipher(password: &str) -> Result<Aes256Gcm, String> {
    let password = password.as_bytes();
    if password.len() != 32 {
        return Err("Password must be at least 32 bytes long".to_string());
    }

    let key = Key::<Aes256Gcm>::from_slice(&password);
    let cipher = Aes256Gcm::new(key);

    Ok(cipher)
}

pub(crate) fn enable_encryption(password: &str) -> Result<(), String> {
    let cipher = new_cipher(password)?;

    CIPHER.write().unwrap().replace(cipher);
    ENCRYPTION_STATUS.write().unwrap().encrypted = true;

    return Ok(());
}

pub(crate) fn disable_encryption() {
    CIPHER.write().unwrap().take();
    ENCRYPTION_STATUS.write().unwrap().encrypted = false;
}