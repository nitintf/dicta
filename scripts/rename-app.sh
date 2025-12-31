#!/bin/bash

# Script to rename the application
# Usage: ./scripts/rename-app.sh <new-name>

set -e

if [ -z "$1" ]; then
    echo "Error: New name is required"
    echo "Usage: ./scripts/rename-app.sh <new-name>"
    echo "Example: ./scripts/rename-app.sh my-awesome-app"
    exit 1
fi

NEW_NAME="$1"
OLD_NAME="tauri-template"

# Convert to kebab-case (replace spaces/underscores with hyphens, lowercase)
NEW_NAME_KEBAB=$(echo "$NEW_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[ _]/-/g' | sed 's/[^a-z0-9-]//g')
NEW_NAME_SNAKE=$(echo "$NEW_NAME_KEBAB" | sed 's/-/_/g')

echo "Renaming application from '$OLD_NAME' to '$NEW_NAME_KEBAB'..."
echo "Using kebab-case: $NEW_NAME_KEBAB"
echo "Using snake_case: $NEW_NAME_SNAKE"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Update package.json
if [ -f package.json ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i.bak "s/\"name\": \"$OLD_NAME\"/\"name\": \"$NEW_NAME_KEBAB\"/" package.json
        rm -f package.json.bak
    else
        # Linux
        sed -i "s/\"name\": \"$OLD_NAME\"/\"name\": \"$NEW_NAME_KEBAB\"/" package.json
    fi
    echo "✓ Updated package.json"
fi

# Update Cargo.toml (package name and lib name)
if [ -f src-tauri/Cargo.toml ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i.bak "s/^name = \"$OLD_NAME\"/name = \"$NEW_NAME_KEBAB\"/" src-tauri/Cargo.toml
        sed -i.bak "s/name = \"grid_base_lib\"/name = \"${NEW_NAME_SNAKE}_lib\"/" src-tauri/Cargo.toml
        rm -f src-tauri/Cargo.toml.bak
    else
        # Linux
        sed -i "s/^name = \"$OLD_NAME\"/name = \"$NEW_NAME_KEBAB\"/" src-tauri/Cargo.toml
        sed -i "s/name = \"grid_base_lib\"/name = \"${NEW_NAME_SNAKE}_lib\"/" src-tauri/Cargo.toml
    fi
    echo "✓ Updated src-tauri/Cargo.toml"
fi

# Update tauri.conf.json (productName, identifier, title)
if [ -f src-tauri/tauri.conf.json ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i.bak "s/\"productName\": \"$OLD_NAME\"/\"productName\": \"$NEW_NAME_KEBAB\"/" src-tauri/tauri.conf.json
        sed -i.bak "s/com\.tauri-template\.app/com.tauri-template.$NEW_NAME_KEBAB/g" src-tauri/tauri.conf.json
        sed -i.bak "s/\"title\": \"$OLD_NAME\"/\"title\": \"$NEW_NAME_KEBAB\"/" src-tauri/tauri.conf.json
        rm -f src-tauri/tauri.conf.json.bak
    else
        # Linux
        sed -i "s/\"productName\": \"$OLD_NAME\"/\"productName\": \"$NEW_NAME_KEBAB\"/" src-tauri/tauri.conf.json
        sed -i "s/com\.nitinpanwar\.$OLD_NAME/com.nitinpanwar.$NEW_NAME_KEBAB/g" src-tauri/tauri.conf.json
        sed -i "s/\"title\": \"$OLD_NAME\"/\"title\": \"$NEW_NAME_KEBAB\"/" src-tauri/tauri.conf.json
    fi
    echo "✓ Updated src-tauri/tauri.conf.json"
fi

# Regenerate Cargo.lock
echo "Regenerating Cargo.lock..."
cd src-tauri
if cargo generate-lockfile > /dev/null 2>&1; then
    echo "✓ Regenerated Cargo.lock"
else
    echo "⚠ Warning: Could not regenerate Cargo.lock (this is okay, it will be regenerated on next build)"
fi

echo ""
echo "✓ Rename complete! The application has been renamed to '$NEW_NAME_KEBAB'"
echo "  Note: You may need to run 'make clean' and rebuild the project."

