// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_file(file_name: String, contents: String) -> Result<(), String> {
    let exec_dir = std::env::current_exe().unwrap().parent().unwrap().to_path_buf();
    println!("saving to: {:?}", exec_dir);
    let file_path = exec_dir.join(file_name);
    match std::fs::write(&file_path, contents) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
