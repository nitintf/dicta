use crate::utils::logger;
use serde_json::Value;
use std::io::{Cursor, Write};
use tauri::{command, AppHandle};
use tauri_plugin_store::StoreExt;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

const STORES: &[(&str, &str)] = &[
    ("settings", "settings.json"),
    ("transcriptions.json", "transcriptions.json"),
    ("snippets.json", "snippets.json"),
    ("vocabulary.json", "vocabulary.json"),
    ("vibes.json", "vibes.json"),
];

/// Export all application data to a zip file
#[command]
pub async fn export_all_data(app: AppHandle) -> Result<Vec<u8>, String> {
    let mut zip_buffer = Cursor::new(Vec::new());
    let mut zip = ZipWriter::new(&mut zip_buffer);

    for (store_name, file_name) in STORES {
        match export_store(&app, store_name, file_name, &mut zip) {
            Ok(_) => logger::info(&format!("Exported {}", file_name)),
            Err(e) => {
                logger::warn(&format!("Warning: Failed to export {}: {}", file_name, e));
                // Continue with other stores even if one fails
            }
        }
    }

    zip.finish()
        .map_err(|e| format!("Failed to finalize zip: {}", e))?;

    Ok(zip_buffer.into_inner())
}

/// Export a single store to the zip file
fn export_store<W: Write + std::io::Seek>(
    app: &AppHandle,
    store_name: &str,
    file_name: &str,
    zip: &mut ZipWriter<W>,
) -> Result<(), String> {
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);

    let store = app
        .store(store_name)
        .map_err(|e| format!("Failed to get {} store: {}", store_name, e))?;

    // For settings store, get the "settings" key; for others, get all data
    let data = if store_name == "settings" {
        store
            .get("settings")
            .ok_or_else(|| format!("No data found in {}", store_name))?
            .clone()
    } else {
        // Get all entries from the store
        let mut all_data = serde_json::Map::new();
        for key in store.keys() {
            if let Some(value) = store.get(&key) {
                all_data.insert(key.clone(), value.clone());
            }
        }
        Value::Object(all_data)
    };

    let json_str = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize {}: {}", file_name, e))?;

    zip.start_file(file_name, options)
        .map_err(|e| format!("Failed to start file {}: {}", file_name, e))?;

    zip.write_all(json_str.as_bytes())
        .map_err(|e| format!("Failed to write {}: {}", file_name, e))?;

    Ok(())
}

/// Import all application data from a zip file
#[command]
pub async fn import_all_data(app: AppHandle, zip_data: Vec<u8>) -> Result<String, String> {
    use std::io::Read;
    use zip::ZipArchive;

    let cursor = Cursor::new(zip_data);
    let mut archive =
        ZipArchive::new(cursor).map_err(|e| format!("Failed to read zip file: {}", e))?;

    let mut imported_files = Vec::new();

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| format!("Failed to read file from zip: {}", e))?;

        let file_name = file.name().to_string();

        // Only process known store files
        if let Some((store_name, _)) = STORES.iter().find(|(_, fname)| *fname == file_name) {
            let mut contents = String::new();
            file.read_to_string(&mut contents)
                .map_err(|e| format!("Failed to read {}: {}", file_name, e))?;

            let data: Value = serde_json::from_str(&contents)
                .map_err(|e| format!("Invalid JSON in {}: {}", file_name, e))?;

            import_store(&app, store_name, &data)?;
            imported_files.push(file_name);
        }
    }

    if imported_files.is_empty() {
        return Err("No valid data files found in the zip".to_string());
    }

    Ok(format!(
        "Successfully imported: {}",
        imported_files.join(", ")
    ))
}

/// Import data into a specific store
fn import_store(app: &AppHandle, store_name: &str, data: &Value) -> Result<(), String> {
    let store = app
        .store(store_name)
        .map_err(|e| format!("Failed to get {} store: {}", store_name, e))?;

    if store_name == "settings" {
        // For settings store, set the "settings" key
        store.set("settings", data.clone());
    } else {
        // For other stores, set each key from the data object
        if let Value::Object(map) = data {
            for (key, value) in map {
                store.set(key, value.clone());
            }
        } else {
            return Err(format!("Invalid data format for {}", store_name));
        }
    }

    store
        .save()
        .map_err(|e| format!("Failed to save {} store: {}", store_name, e))?;

    Ok(())
}

/// Import data from individual JSON files (non-zip)
#[command]
pub async fn import_from_json(
    app: AppHandle,
    file_name: String,
    json_data: String,
) -> Result<String, String> {
    // Find the matching store for this file
    let store_info = STORES
        .iter()
        .find(|(_, fname)| *fname == file_name)
        .ok_or_else(|| format!("Unknown file: {}", file_name))?;

    let data: Value =
        serde_json::from_str(&json_data).map_err(|e| format!("Invalid JSON: {}", e))?;

    import_store(&app, store_info.0, &data)?;

    Ok(format!("Successfully imported {}", file_name))
}
