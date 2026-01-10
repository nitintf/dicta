#!/bin/bash

# Release script for Dicta with Separate Architecture Binaries
# Usage:
#   ./scripts/release.sh [patch|minor|major]            - Full release
#   ./scripts/release.sh [patch|minor|major] --dry-run  - Preview what would happen
#   ./scripts/release.sh --build-only                   - Build & upload only (skip version bump)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
BUILD_ONLY=false
DRY_RUN=false
RELEASE_TYPE=""

# Parse all arguments
for arg in "$@"; do
    case "$arg" in
        --build-only)
            BUILD_ONLY=true
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        patch|minor|major)
            RELEASE_TYPE="$arg"
            ;;
        *)
            echo -e "${RED}Usage: $0 [patch|minor|major|--build-only] [--dry-run]${NC}"
            exit 1
            ;;
    esac
done

# Validate arguments
if [[ "$BUILD_ONLY" == false && -z "$RELEASE_TYPE" ]]; then
    echo -e "${RED}Usage: $0 [patch|minor|major|--build-only] [--dry-run]${NC}"
    exit 1
fi

if [[ "$DRY_RUN" == true ]]; then
    echo -e "${BLUE}=== DRY RUN MODE - No changes will be made ===${NC}"
fi

# Trap to ensure cleanup happens even on error
trap 'echo -e "${RED}Script failed! Check the error above.${NC}"' ERR

require_cmd() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo -e "${RED}Error: Required command not found: $cmd${NC}"
        exit 1
    fi
}

require_file() {
    local path="$1"
    if [[ ! -f "$path" ]]; then
        echo -e "${RED}Error: Required file not found: $path${NC}"
        exit 1
    fi
}

# Check for Tauri signing credentials - also check common path
TAURI_KEY_PATH="$HOME/.tauri/dicta.key"
if [[ -z "${TAURI_SIGNING_PRIVATE_KEY:-}" ]] && [[ -z "${TAURI_SIGNING_PRIVATE_KEY_PATH:-}" ]] && [[ ! -f "$TAURI_KEY_PATH" ]]; then
    echo -e "${YELLOW}Warning: Tauri signing key not configured, update artifacts will not be signed${NC}"
else
    if [[ -f "$TAURI_KEY_PATH" ]] && [[ -z "${TAURI_SIGNING_PRIVATE_KEY_PATH:-}" ]]; then
        # Auto-detect key at common location
        export TAURI_SIGNING_PRIVATE_KEY_PATH="$TAURI_KEY_PATH"
        echo -e "${GREEN}✓ Tauri signing key found at $TAURI_KEY_PATH${NC}"
    else
        echo -e "${GREEN}✓ Tauri signing configured${NC}"
    fi
fi

if [[ "$BUILD_ONLY" == true ]]; then
    echo -e "${GREEN}🔨 Starting Dicta BUILD-ONLY mode${NC}"
else
    echo -e "${GREEN}🚀 Starting Dicta release process (${RELEASE_TYPE})${NC}"
fi

require_cmd git
require_cmd pnpm
require_cmd jq
require_cmd cargo
require_cmd gh
require_file package.json
require_file src-tauri/Cargo.toml

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo -e "${RED}Error: Must run releases from main branch (currently on ${CURRENT_BRANCH})${NC}"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}Warning: You have uncommitted changes (ignored for dry-run)${NC}"
        git status -s
    else
        echo -e "${RED}Error: You have uncommitted changes${NC}"
        git status -s
        exit 1
    fi
fi

# Pull latest changes (skip for dry-run)
if [[ "$DRY_RUN" == true ]]; then
    echo -e "${BLUE}[DRY RUN] Would pull latest changes${NC}"
else
    echo -e "${YELLOW}Pulling latest changes...${NC}"
    git pull --ff-only origin main
fi

if [[ "$BUILD_ONLY" == true ]]; then
    # BUILD-ONLY MODE: Get version and verify tag/release exist
    NEW_VERSION=$(node -p "require('./package.json').version")
    echo -e "${GREEN}Using existing version: ${NEW_VERSION}${NC}"

    # Verify tag exists
    if ! git tag -l "v${NEW_VERSION}" | grep -q "v${NEW_VERSION}"; then
        echo -e "${RED}Error: Tag v${NEW_VERSION} does not exist${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Tag v${NEW_VERSION} exists${NC}"

    # Verify draft release exists
    if ! gh release view "v${NEW_VERSION}" &>/dev/null; then
        echo -e "${RED}Error: GitHub release v${NEW_VERSION} does not exist${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Draft release v${NEW_VERSION} exists${NC}"
else
    # FULL RELEASE MODE: Bump version, tag, create release

    # Run typecheck first
    echo -e "${YELLOW}Running typecheck...${NC}"
    pnpm typecheck

    # Run backend tests
    # echo -e "${YELLOW}Running backend tests...${NC}"
    # pnpm test:backend

    # Check there are commits since last tag
    LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    if [[ -n "$LAST_TAG" ]]; then
        COMMIT_COUNT=$(git rev-list "${LAST_TAG}..HEAD" --count)
        if [[ "$COMMIT_COUNT" -eq 0 ]]; then
            echo -e "${RED}Error: No commits since last tag ${LAST_TAG}${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Found ${COMMIT_COUNT} commits since ${LAST_TAG}${NC}"
    fi

    # Get current version
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"

    # Calculate new version
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
    case "$RELEASE_TYPE" in
        major) NEW_VERSION="$((MAJOR + 1)).0.0" ;;
        minor) NEW_VERSION="${MAJOR}.$((MINOR + 1)).0" ;;
        patch) NEW_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))" ;;
    esac
    echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would bump version: ${CURRENT_VERSION} → ${NEW_VERSION}${NC}"
        echo -e "${BLUE}[DRY RUN] Would update: package.json, Cargo.toml, CHANGELOG.md${NC}"
        echo -e "${BLUE}[DRY RUN] Would commit: 'chore: release v${NEW_VERSION}'${NC}"
        echo -e "${BLUE}[DRY RUN] Would create tag: v${NEW_VERSION}${NC}"
        echo -e "${BLUE}[DRY RUN] Would push to origin/main${NC}"
        echo -e "${BLUE}[DRY RUN] Would create draft GitHub release: v${NEW_VERSION}${NC}"
        echo -e "${BLUE}[DRY RUN] Would build aarch64-apple-darwin${NC}"
        echo -e "${BLUE}[DRY RUN] Would build x86_64-apple-darwin${NC}"
        echo -e "${BLUE}[DRY RUN] Would sign and upload artifacts${NC}"
        echo ""
        echo -e "${GREEN}=== DRY RUN COMPLETE - No changes made ===${NC}"
        exit 0
    fi

    # Bump version
    echo -e "${YELLOW}Bumping version (${RELEASE_TYPE})...${NC}"
    npm version "$RELEASE_TYPE" --no-git-tag-version

    # Update Cargo.toml
    echo -e "${YELLOW}Updating Cargo.toml...${NC}"
    sed -i '' "s/^version = \".*\"/version = \"${NEW_VERSION}\"/" src-tauri/Cargo.toml

    # Generate changelog
    echo -e "${YELLOW}Generating changelog...${NC}"
    npx conventional-changelog -p angular -i CHANGELOG.md -s

    # Commit, tag, push
    echo -e "${YELLOW}Committing and tagging...${NC}"
    git add package.json src-tauri/Cargo.toml CHANGELOG.md
    git commit -m "chore: release v${NEW_VERSION}"
    git tag "v${NEW_VERSION}"
    git push origin main
    git push origin "v${NEW_VERSION}"

    # Create draft GitHub release
    echo -e "${YELLOW}Creating draft GitHub release...${NC}"
    gh release create "v${NEW_VERSION}" --draft --title "Dicta v${NEW_VERSION} (macOS Universal)" --generate-notes
    echo -e "${GREEN}✓ Draft release v${NEW_VERSION} created${NC}"
fi

# Install required Rust targets if not already installed
echo -e "${YELLOW}Checking Rust targets...${NC}"
rustup target add aarch64-apple-darwin 2>/dev/null || true
rustup target add x86_64-apple-darwin 2>/dev/null || true

# Create output directory
OUTPUT_DIR="release-${NEW_VERSION}"
mkdir -p "$OUTPUT_DIR"

# Function to sign update artifacts
sign_update_artifact() {
    local FILE_PATH="$1"

    if [[ -n "${TAURI_SIGNING_PRIVATE_KEY:-}" ]] || [[ -n "${TAURI_SIGNING_PRIVATE_KEY_PATH:-}" ]]; then
        echo -e "${YELLOW}Signing $(basename "$FILE_PATH")...${NC}"

        # Determine if we have a key path or key content
        if [[ -n "${TAURI_SIGNING_PRIVATE_KEY_PATH:-}" ]]; then
            KEY_PATH="$TAURI_SIGNING_PRIVATE_KEY_PATH"
        else
            # It's key content - write to temp file
            TEMP_KEY=$(mktemp)
            echo "${TAURI_SIGNING_PRIVATE_KEY}" > "$TEMP_KEY"
            KEY_PATH="$TEMP_KEY"
        fi

        # Sign with proper flags (use pnpm tauri, not cargo tauri)
        if [[ -n "${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}" ]]; then
            pnpm tauri signer sign -f "$KEY_PATH" -p "$TAURI_SIGNING_PRIVATE_KEY_PASSWORD" "$FILE_PATH"
        else
            # Try with empty password
            pnpm tauri signer sign -f "$KEY_PATH" -p "" "$FILE_PATH"
        fi

        # Clean up temp file if created
        if [[ -n "${TEMP_KEY:-}" ]] && [[ -f "$TEMP_KEY" ]]; then
            rm -f "$TEMP_KEY"
        fi

        if [[ -f "${FILE_PATH}.sig" ]]; then
            echo -e "${GREEN}✓ Signature created for $(basename "$FILE_PATH")${NC}"
            return 0
        else
            echo -e "${RED}Warning: Signature file not created for $(basename "$FILE_PATH")${NC}"
            return 1
        fi
    else
        echo -e "${RED}Error: Missing Tauri signing key; cannot sign update artifacts${NC}"
        return 1
    fi
}


# Build aarch64 binary
echo -e "${GREEN}🔨 Building aarch64 binary...${NC}"
echo -e "${BLUE}This will take some time...${NC}"

# Build with bundles
pnpm tauri build --target aarch64-apple-darwin --bundles app,dmg

# Find aarch64 build artifacts
AARCH64_DMG=$(find "src-tauri/target/aarch64-apple-darwin/release/bundle/dmg" -name "*.dmg" | head -n 1)
AARCH64_APP_DIR="src-tauri/target/aarch64-apple-darwin/release/bundle/macos"

# Create app.tar.gz for aarch64
echo -e "${YELLOW}Creating aarch64 updater archive...${NC}"
APP_BUNDLE_PATH=$(find "$AARCH64_APP_DIR" -maxdepth 1 -name "*.app" | head -n 1)
if [[ -n "${APP_BUNDLE_PATH}" && -d "$APP_BUNDLE_PATH" ]]; then
    cd "$AARCH64_APP_DIR"
    APP_BUNDLE_NAME=$(basename "$APP_BUNDLE_PATH")
    COPYFILE_DISABLE=1 tar -czf "Dicta_${NEW_VERSION}_aarch64.app.tar.gz" --exclude='._*' --exclude='.DS_Store' "$APP_BUNDLE_NAME"
    cd - > /dev/null
    AARCH64_APP_TAR="$AARCH64_APP_DIR/Dicta_${NEW_VERSION}_aarch64.app.tar.gz"
else
    echo -e "${RED}Error: aarch64 app bundle not found${NC}"
    exit 1
fi

if [[ -z "$AARCH64_DMG" ]]; then
    echo -e "${RED}Error: aarch64 DMG not found${NC}"
    exit 1
fi

# Copy aarch64 artifacts
cp "$AARCH64_DMG" "$OUTPUT_DIR/Dicta_${NEW_VERSION}_aarch64.dmg"
cp "$AARCH64_APP_TAR" "$OUTPUT_DIR/Dicta_${NEW_VERSION}_aarch64.app.tar.gz"

# Sign aarch64 update artifact (optional)
if sign_update_artifact "$AARCH64_APP_TAR"; then
    if [[ -f "${AARCH64_APP_TAR}.sig" ]]; then
        cp "${AARCH64_APP_TAR}.sig" "$OUTPUT_DIR/Dicta_${NEW_VERSION}_aarch64.app.tar.gz.sig"
    fi
else
    echo -e "${YELLOW}Warning: Skipping signature for update artifact${NC}"
fi

# Build x86_64 binary
echo -e "${GREEN}🔨 Building x86_64 binary...${NC}"
echo -e "${BLUE}This will take some time...${NC}"

# Build with bundles
pnpm tauri build --target x86_64-apple-darwin --bundles app,dmg

# Find x86_64 build artifacts
X86_64_DMG=$(find "src-tauri/target/x86_64-apple-darwin/release/bundle/dmg" -name "*.dmg" | head -n 1)
X86_64_APP_DIR="src-tauri/target/x86_64-apple-darwin/release/bundle/macos"

# Create app.tar.gz for x86_64
echo -e "${YELLOW}Creating x86_64 updater archive...${NC}"
APP_BUNDLE_PATH_X86=$(find "$X86_64_APP_DIR" -maxdepth 1 -name "*.app" | head -n 1)
if [[ -n "${APP_BUNDLE_PATH_X86}" && -d "$APP_BUNDLE_PATH_X86" ]]; then
    cd "$X86_64_APP_DIR"
    APP_BUNDLE_NAME_X86=$(basename "$APP_BUNDLE_PATH_X86")
    COPYFILE_DISABLE=1 tar -czf "Dicta_${NEW_VERSION}_x86_64.app.tar.gz" --exclude='._*' --exclude='.DS_Store' "$APP_BUNDLE_NAME_X86"
    cd - > /dev/null
    X86_64_APP_TAR="$X86_64_APP_DIR/Dicta_${NEW_VERSION}_x86_64.app.tar.gz"
else
    echo -e "${RED}Error: x86_64 app bundle not found${NC}"
    exit 1
fi

if [[ -z "$X86_64_DMG" ]]; then
    echo -e "${RED}Error: x86_64 DMG not found${NC}"
    exit 1
fi

# Copy x86_64 artifacts
cp "$X86_64_DMG" "$OUTPUT_DIR/Dicta_${NEW_VERSION}_x86_64.dmg"
cp "$X86_64_APP_TAR" "$OUTPUT_DIR/Dicta_${NEW_VERSION}_x86_64.app.tar.gz"

# Sign x86_64 update artifact (optional)
if sign_update_artifact "$X86_64_APP_TAR"; then
    if [[ -f "${X86_64_APP_TAR}.sig" ]]; then
        cp "${X86_64_APP_TAR}.sig" "$OUTPUT_DIR/Dicta_${NEW_VERSION}_x86_64.app.tar.gz.sig"
    fi
else
    echo -e "${YELLOW}Warning: Skipping signature for x86_64 update artifact${NC}"
fi

# Create latest.json for updater (Apple Silicon and Intel)
echo -e "${YELLOW}Creating latest.json...${NC}"

# Get aarch64 signature from the sig file if it exists
AARCH64_SIGNATURE=""
if [[ -f "$OUTPUT_DIR/Dicta_${NEW_VERSION}_aarch64.app.tar.gz.sig" ]]; then
    AARCH64_SIGNATURE=$(cat "$OUTPUT_DIR/Dicta_${NEW_VERSION}_aarch64.app.tar.gz.sig" | tr -d '\n')
fi

# Get x86_64 signature from the sig file if it exists
X86_64_SIGNATURE=""
if [[ -f "$OUTPUT_DIR/Dicta_${NEW_VERSION}_x86_64.app.tar.gz.sig" ]]; then
    X86_64_SIGNATURE=$(cat "$OUTPUT_DIR/Dicta_${NEW_VERSION}_x86_64.app.tar.gz.sig" | tr -d '\n')
fi

# Create latest.json with both architectures
printf '{
  "version": "v%s",
  "notes": "See the release notes for v%s",
  "pub_date": "%s",
  "platforms": {
    "darwin-aarch64": {
      "signature": "%s",
      "url": "https://github.com/anomalyco/dicta/releases/download/v%s/Dicta_%s_aarch64.app.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "%s",
      "url": "https://github.com/anomalyco/dicta/releases/download/v%s/Dicta_%s_x86_64.app.tar.gz"
    }
  }
}\n' "$NEW_VERSION" "$NEW_VERSION" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$AARCH64_SIGNATURE" "$NEW_VERSION" "$NEW_VERSION" "$X86_64_SIGNATURE" "$NEW_VERSION" "$NEW_VERSION" > "$OUTPUT_DIR/latest.json"

# Upload artifacts to the draft GitHub release created by release-it
echo -e "${YELLOW}Uploading artifacts to GitHub release v${NEW_VERSION}...${NC}"
gh release view "v${NEW_VERSION}" >/dev/null
for file in "$OUTPUT_DIR"/*; do
    echo -e "  Uploading: $(basename "$file")"
    gh release upload "v${NEW_VERSION}" "$file" --clobber
done
echo -e "${GREEN}✓ All artifacts uploaded successfully${NC}"

echo -e "${GREEN}✅ Release process complete!${NC}"
echo -e "${GREEN}📁 Artifacts saved in: ${OUTPUT_DIR}/${NC}"
echo ""
echo -e "${BLUE}📦 Release artifacts:${NC}"
ls -lh "$OUTPUT_DIR" | grep -E '\.(dmg|tar\.gz|sig|json)$' | while read -r line; do
    echo "   $line"
done
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Review the draft release on GitHub"
echo "2. Test the DMGs (Apple Silicon and Intel)"
echo "3. Verify auto-updater works with the new signatures (if signed)"
echo "4. Publish the release when ready"
echo ""
echo -e "${GREEN}🔗 Release URL: https://github.com/anomalyco/dicta/releases/tag/v${NEW_VERSION}${NC}"
echo -e "${GREEN}🎉 Your macOS apps are ready for distribution!${NC}"

