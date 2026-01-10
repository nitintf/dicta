fn main() {
    // Set the deployment target to match our minimum system version
    println!("cargo:rustc-env=MACOSX_DEPLOYMENT_TARGET=13.0");

    // Pass WHISPER_NO_I8MM to whisper-rs-sys build
    if std::env::var("WHISPER_NO_I8MM").is_ok() {
        println!("cargo:rerun-if-env-changed=WHISPER_NO_I8MM");
    }
    tauri_build::build()
}
