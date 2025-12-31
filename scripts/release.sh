#!/bin/bash

# Script to create a new release
# Usage: ./scripts/release.sh [patch|minor|major]
# Default: patch

set -e

VERSION_TYPE="${1:-patch}"

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "Error: Invalid version type. Must be one of: patch, minor, major"
    echo "Usage: ./scripts/release.sh [patch|minor|major]"
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Working directory is not clean. Please commit or stash your changes."
    exit 1
fi

# Check if we're on main/master branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo "Warning: You're not on main/master branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Creating $VERSION_TYPE release..."
echo ""

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Calculate new version
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

case $VERSION_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"
echo ""

# Update version in package.json
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
    rm -f package.json.bak
else
    # Linux
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
fi

# Update version in Cargo.toml
if [ -f src-tauri/Cargo.toml ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i.bak "s/^version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
        rm -f src-tauri/Cargo.toml.bak
    else
        # Linux
        sed -i "s/^version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
    fi
fi

# Update version in tauri.conf.json
if [ -f src-tauri/tauri.conf.json ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
        rm -f src-tauri/tauri.conf.json.bak
    else
        # Linux
        sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
    fi
fi

echo "✓ Updated version to $NEW_VERSION in all files"
echo ""

# Run tests/lint if available (optional)
if command -v pnpm &> /dev/null; then
    echo "Running linter..."
    pnpm lint || echo "⚠ Linter found issues, but continuing..."
    echo ""
fi

# Build the application
echo "Building application..."
if command -v make &> /dev/null; then
    make build
else
    echo "⚠ Make not found, running build directly..."
    pnpm tauri build
fi

if [ $? -ne 0 ]; then
    echo "Error: Build failed. Aborting release."
    exit 1
fi

echo ""
echo "✓ Build successful"
echo ""

# Create git tag
TAG="v$NEW_VERSION"
echo "Creating git tag: $TAG"
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
git commit -m "chore: bump version to $NEW_VERSION" || echo "⚠ No changes to commit"
git tag -a "$TAG" -m "Release $TAG"

echo ""
echo "✓ Release $NEW_VERSION created successfully!"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git log --oneline -1"
echo "  2. Push the tag: git push origin $TAG"
echo "  3. Push the commit: git push origin $CURRENT_BRANCH"
echo ""

