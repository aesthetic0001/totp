use std::sync::RwLock;
use aes_gcm::{Aes256Gcm, Key, KeyInit, Nonce};
use aes_gcm::aead::{Aead};
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use sha3::{Digest, Sha3_256};
use crate::get_save_dir;

#[derive(Default, Serialize, Deserialize)]
struct EncryptionStatus {
    encrypted: bool,
    hash: String,
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

pub(crate) fn try_decrypt(data: &str) -> Result<String, String> {
    if !is_encrypted() {
        return Ok(data.to_string());
    }
    
    let data = hex::decode(data).map_err(|e| e.to_string())?;
    let data = data.as_slice();
    let nonce = [0u8; 12];
    let nonce = Nonce::from_slice(&nonce);
    let cipher = CIPHER.read().unwrap();
    let cipher = cipher.as_ref().ok_or("Cipher not initialized".to_string())?;
    let decrypted = cipher.decrypt(&nonce, data).map_err(|e| e.to_string())?;
    let decrypted = String::from_utf8(decrypted).map_err(|e| e.to_string())?;

    Ok(decrypted)
}

pub(crate) fn encrypt(data: &str) -> Result<String, String> {
    if !is_encrypted() || CIPHER.read().unwrap().is_none() {
        return Err("Encryption not enabled".to_string());
    }

    let cipher = CIPHER.read().unwrap();
    let cipher = cipher.as_ref().ok_or("Cipher not initialized".to_string())?;
    let nonce = [0u8; 12];
    let nonce = Nonce::from_slice(&nonce);
    let encrypted = cipher.encrypt(&nonce, data.as_bytes()).map_err(|e| e.to_string())?;
    let encrypted = hex::encode(encrypted);

    Ok(encrypted)
}


fn new_cipher(password: &str) -> Result<Aes256Gcm, String> {
    let password = password.as_bytes();
    // if not 32 bytes, fill remaining with 0
    let password = if password.len() < 32 {
        let mut new_password = [0u8; 32];
        new_password[..password.len()].copy_from_slice(password);
        new_password
    } else {
        let mut new_password = [0u8; 32];
        new_password.copy_from_slice(&password[..32]);
        new_password
    };

    let key = Key::<Aes256Gcm>::from_slice(&password);
    let cipher = Aes256Gcm::new(key);

    Ok(cipher)
}

pub(crate) fn enable_encryption(password: &str) -> Result<(), String> {
    let cipher = new_cipher(password)?;

    CIPHER.write().unwrap().replace(cipher);
    ENCRYPTION_STATUS.write().unwrap().encrypted = true;

    let mut hasher = Sha3_256::new();

    hasher.update(password);

    let hash = hasher.finalize();
    let hash = hex::encode(hash);

    ENCRYPTION_STATUS.write().unwrap().hash = hash;
    // save the encryption status
    let save_path = get_save_dir().join("encryption_status.json");
    std::fs::write(&save_path, serde_json::to_string(&*ENCRYPTION_STATUS.read().unwrap()).unwrap()).unwrap();

    return Ok(());
}

pub(crate) fn check_password(password: &str) -> bool {
    let mut hasher = Sha3_256::new();
    hasher.update(password);
    let hash = hasher.finalize();
    let hash = hex::encode(hash);
    let res = hash == ENCRYPTION_STATUS.read().unwrap().hash;
    if res {
        let cipher = new_cipher(password).unwrap();
        CIPHER.write().unwrap().replace(cipher);
    }
    res
}

pub(crate) fn disable_encryption() {
    CIPHER.write().unwrap().take();
    ENCRYPTION_STATUS.write().unwrap().encrypted = false;
    ENCRYPTION_STATUS.write().unwrap().hash = "".to_string();
    let save_path = get_save_dir().join("encryption_status.json");
    std::fs::write(&save_path, serde_json::to_string(&*ENCRYPTION_STATUS.read().unwrap()).unwrap()).unwrap();
}