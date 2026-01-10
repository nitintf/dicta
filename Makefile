.PHONY: help generate-types dev build clean rename release

# Default target - show help
help:
	@echo "Usage: make <target>"
	@echo "Targets:"
	@echo "  generate-types - Generate TypeScript types from Rust"
	@echo "  dev - Run development server (generates types first, then starts dev server)"
	@echo "  build - Build the application"
	@echo "  clean - Clean build artifacts"
	@echo "  rename NEW_NAME=<new-name> - Rename the application (e.g., make rename NEW_NAME=my-app)"
	@echo "  release [VERSION_TYPE=patch] - Create a new release (patch/minor/major, default: patch)"
	@echo "    Example: make release VERSION_TYPE=minor"
	@echo "    For dry-run or build-only, run: ./scripts/release.sh [patch|minor|major] --dry-run"
	@echo "    Or: ./scripts/release.sh --build-only"
	@echo "  help - Show this help message"

# Generate TypeScript types from Rust
generate-types:
	@cd src-tauri && cargo test export_bindings --quiet
	@echo "✓ Types generated in src/types/"

# Run development server (generates types first, then starts dev server)
dev: generate-types
	@echo "Starting development server..."
	pnpm tauri dev

# Build the application
build: generate-types
	@echo "Building application..."
	pnpm tauri build

# Clean build artifacts
clean:
	cd src-tauri && cargo clean
	rm -rf src/types

# Create a new release
# Usage: make release [VERSION_TYPE=patch]
# VERSION_TYPE can be: patch, minor, or major (default: patch)
release:
	@VERSION_TYPE=$${VERSION_TYPE:-patch}; ./scripts/release.sh "$$VERSION_TYPE"
