// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn get_exec_dir() -> std::path::PathBuf {
    std::env::current_exe().unwrap().parent().unwrap().to_path_buf()
}

#[tauri::command]
fn get_saved_totp() -> Result<String, String> {
    let file_path = get_exec_dir().join("totp.txt");
    let file = std::fs::read_to_string(file_path.clone());
    match file {
        Ok(content) => Ok(content),
        Err(err) => {
            if err.kind() == std::io::ErrorKind::NotFound {
                std::fs::write(file_path, "".as_bytes()).unwrap();
                Ok("".to_string())
            } else {
                Err("Unable to read file".to_string())
            }
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_saved_totp])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
