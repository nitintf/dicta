#!/bin/bash

# Release script for Dicta with Separate Architecture Binaries
# Usage:
#   ./scripts/release.sh [patch|minor|major]            - Full release
#   ./scripts/release.sh [patch|minor|major] --dry-run  - Preview what would happen
#   ./scripts/release.sh --build-only                   - Build & upload only (skip version bump)

set -euo pipefail

# ============================================================================
# Constants
# ============================================================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly GITHUB_REPO="anomalyco/dicta"
readonly APP_NAME="Dicta"
readonly MAIN_BRANCH="main"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# ============================================================================
# Global Variables
# ============================================================================
BUILD_ONLY=false
DRY_RUN=false
RELEASE_TYPE=""
NEW_VERSION=""
CURRENT_VERSION=""
OUTPUT_DIR=""
TEMP_FILES=()  # Initialize as empty array
VERSION_FILES_MODIFIED=false

# ============================================================================
# Utility Functions
# ============================================================================

log_info() {
    echo -e "${GREEN}${1}${NC}"
}

log_warn() {
    echo -e "${YELLOW}${1}${NC}"
}

log_error() {
    echo -e "${RED}${1}${NC}"
}

log_step() {
    echo -e "${BLUE}${1}${NC}"
}

# Cleanup function for temporary files and version changes
cleanup() {
    local exit_code=$?

    # Clean up temporary files (safely handle array with set -u)
    if declare -p TEMP_FILES &>/dev/null && [[ ${#TEMP_FILES[@]} -gt 0 ]]; then
        for temp_file in "${TEMP_FILES[@]}"; do
            if [[ -f "$temp_file" ]]; then
                rm -f "$temp_file"
            fi
        done
    fi

    # Revert version changes if build failed and we modified files
    if [[ $exit_code -ne 0 ]] && [[ "$VERSION_FILES_MODIFIED" == true ]] && [[ -n "$CURRENT_VERSION" ]]; then
        log_warn "Build failed! Reverting version changes..."
        cd "$REPO_ROOT"
        git checkout -- package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json CHANGELOG.md 2>/dev/null || true
        log_warn "Version changes have been reverted. You can try again."
    fi

    if [[ $exit_code -ne 0 ]]; then
        log_error "Script failed at line $LINENO with exit code $exit_code"
        log_error "Check the error above for details."
    fi
}

trap cleanup EXIT ERR

require_cmd() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Error: Required command not found: $cmd"
        exit 1
    fi
}

require_file() {
    local path="$1"
    if [[ ! -f "$path" ]]; then
        log_error "Error: Required file not found: $path"
        exit 1
    fi
}

validate_version() {
    local version="$1"
    if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_error "Error: Invalid version format: $version (expected: X.Y.Z)"
        exit 1
    fi
}

# ============================================================================
# Argument Parsing
# ============================================================================

parse_arguments() {
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
                log_error "Usage: $0 [patch|minor|major|--build-only] [--dry-run]"
                exit 1
                ;;
        esac
    done

    if [[ "$BUILD_ONLY" == false && -z "$RELEASE_TYPE" ]]; then
        log_error "Usage: $0 [patch|minor|major|--build-only] [--dry-run]"
        exit 1
    fi

    if [[ "$DRY_RUN" == true ]]; then
        log_step "=== DRY RUN MODE - No changes will be made ==="
    fi
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

check_prerequisites() {
    log_step "Checking prerequisites..."

    require_cmd git
    require_cmd pnpm
    require_cmd jq
    require_cmd cargo
    require_cmd gh
    require_file "$REPO_ROOT/package.json"
    require_file "$REPO_ROOT/src-tauri/Cargo.toml"

    # Check if we're on main branch
    local current_branch
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "$MAIN_BRANCH" ]]; then
        log_error "Error: Must run releases from $MAIN_BRANCH branch (currently on ${current_branch})"
        exit 1
    fi

    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        if [[ "$DRY_RUN" == true ]]; then
            log_warn "Warning: You have uncommitted changes (ignored for dry-run)"
            git status -s
        else
            log_error "Error: You have uncommitted changes"
            git status -s
            exit 1
        fi
    fi

    # Pull latest changes (skip for dry-run)
    if [[ "$DRY_RUN" == true ]]; then
        log_step "[DRY RUN] Would pull latest changes"
    else
        log_step "Pulling latest changes..."
        git pull --ff-only origin "$MAIN_BRANCH"
    fi
}

check_signing_key() {
    local tauri_key_path="$HOME/.tauri/dicta.key"

    if [[ -z "${TAURI_SIGNING_PRIVATE_KEY:-}" ]] && \
       [[ -z "${TAURI_SIGNING_PRIVATE_KEY_PATH:-}" ]] && \
       [[ ! -f "$tauri_key_path" ]]; then
        log_warn "Warning: Tauri signing key not configured, update artifacts will not be signed"
    else
        if [[ -f "$tauri_key_path" ]] && [[ -z "${TAURI_SIGNING_PRIVATE_KEY_PATH:-}" ]]; then
            export TAURI_SIGNING_PRIVATE_KEY_PATH="$tauri_key_path"
            log_info "✓ Tauri signing key found at $tauri_key_path"
        else
            log_info "✓ Tauri signing configured"
        fi
    fi
}

# ============================================================================
# Version Management
# ============================================================================

get_current_version() {
    node -p "require('$REPO_ROOT/package.json').version"
}

calculate_new_version() {
    local current_version="$1"
    local release_type="$2"

    validate_version "$current_version"

    IFS='.' read -r major minor patch <<< "$current_version"

    case "$release_type" in
        major)
            echo "$((major + 1)).0.0"
            ;;
        minor)
            echo "${major}.$((minor + 1)).0"
            ;;
        patch)
            echo "${major}.${minor}.$((patch + 1))"
            ;;
        *)
            log_error "Error: Invalid release type: $release_type"
            exit 1
            ;;
    esac
}

bump_version() {
    local new_version="$1"

    if [[ "$DRY_RUN" == true ]]; then
        log_step "[DRY RUN] Would bump version to ${new_version}"
        return
    fi

    log_step "Bumping version to ${new_version} (not committed yet)..."

    # Update package.json
    npm version "$RELEASE_TYPE" --no-git-tag-version

    # Update Cargo.toml
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s/^version = \".*\"/version = \"${new_version}\"/" "$REPO_ROOT/src-tauri/Cargo.toml"
    else
        sed -i "s/^version = \".*\"/version = \"${new_version}\"/" "$REPO_ROOT/src-tauri/Cargo.toml"
    fi

    # Update tauri.conf.json
    log_step "Updating tauri.conf.json..."
    cd "$REPO_ROOT"
    jq --arg version "$new_version" '.version = $version' src-tauri/tauri.conf.json > src-tauri/tauri.conf.json.tmp
    mv src-tauri/tauri.conf.json.tmp src-tauri/tauri.conf.json

    # Generate changelog
    log_step "Generating changelog..."
    npx conventional-changelog -p angular -i CHANGELOG.md -s

    # Mark that we've modified version files (for cleanup on failure)
    VERSION_FILES_MODIFIED=true
}

# ============================================================================
# Git Operations
# ============================================================================

check_commits_since_last_tag() {
    local last_tag
    last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

    if [[ -n "$last_tag" ]]; then
        local commit_count
        commit_count=$(git rev-list "${last_tag}..HEAD" --count)
        if [[ "$commit_count" -eq 0 ]]; then
            log_error "Error: No commits since last tag ${last_tag}"
            exit 1
        fi
        log_info "✓ Found ${commit_count} commits since ${last_tag}"
    fi
}

create_release_commit_and_tag() {
    local version="$1"

    if [[ "$DRY_RUN" == true ]]; then
        log_step "[DRY RUN] Would commit and tag v${version}"
        return
    fi

    log_step "Committing and tagging v${version}..."
    cd "$REPO_ROOT"
    git add package.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json CHANGELOG.md
    git commit -m "chore: release v${version}"
    git tag "v${version}"
    git push origin "$MAIN_BRANCH"
    git push origin "v${version}"
}

create_github_release() {
    local version="$1"

    if [[ "$DRY_RUN" == true ]]; then
        log_step "[DRY RUN] Would create draft GitHub release: v${version}"
        return
    fi

    log_step "Creating draft GitHub release..."
    gh release create "v${version}" \
        --draft \
        --title "${APP_NAME} v${version} (macOS Universal)" \
        --generate-notes
    log_info "✓ Draft release v${version} created"
}

verify_build_only_prerequisites() {
    local version="$1"

    log_info "Using existing version: ${version}"

    # Verify tag exists
    if ! git tag -l "v${version}" | grep -q "v${version}"; then
        log_error "Error: Tag v${version} does not exist"
        exit 1
    fi
    log_info "✓ Tag v${version} exists"

    # Verify draft release exists
    if ! gh release view "v${version}" &>/dev/null; then
        log_error "Error: GitHub release v${version} does not exist"
        exit 1
    fi
    log_info "✓ Draft release v${version} exists"
}

# ============================================================================
# Build Functions
# ============================================================================

ensure_rust_targets() {
    log_step "Checking Rust targets..."
    rustup target add aarch64-apple-darwin 2>/dev/null || true
    rustup target add x86_64-apple-darwin 2>/dev/null || true
}

sign_update_artifact() {
    local file_path="$1"

    if [[ -z "${TAURI_SIGNING_PRIVATE_KEY:-}" ]] && [[ -z "${TAURI_SIGNING_PRIVATE_KEY_PATH:-}" ]]; then
        log_warn "Warning: Missing Tauri signing key; cannot sign update artifacts"
        return 1
    fi

    log_step "Signing $(basename "$file_path")..."

    local key_path
    if [[ -n "${TAURI_SIGNING_PRIVATE_KEY_PATH:-}" ]]; then
        key_path="$TAURI_SIGNING_PRIVATE_KEY_PATH"
    else
        # It's key content - write to temp file
        local temp_key
        temp_key=$(mktemp)
        echo "${TAURI_SIGNING_PRIVATE_KEY}" > "$temp_key"
        TEMP_FILES+=("$temp_key")
        key_path="$temp_key"
    fi

    # Sign with proper flags
    local password="${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}"
    if pnpm tauri signer sign -f "$key_path" -p "$password" "$file_path" 2>/dev/null; then
        if [[ -f "${file_path}.sig" ]]; then
            log_info "✓ Signature created for $(basename "$file_path")"
            return 0
        fi
    fi

    log_warn "Warning: Signature file not created for $(basename "$file_path")"
    return 1
}

build_for_architecture() {
    local target="$1"
    local version="$2"
    local arch_name="$3"

    log_info "🔨 Building ${arch_name} binary..."
    log_step "This will take some time..."

    if [[ "$DRY_RUN" == true ]]; then
        log_step "[DRY RUN] Would build ${target}"
        return
    fi

    # Build with bundles
    cd "$REPO_ROOT"
    pnpm tauri build --target "$target" --bundles app,dmg

    # Find build artifacts
    local dmg_path
    dmg_path=$(find "src-tauri/target/${target}/release/bundle/dmg" -name "*.dmg" 2>/dev/null | head -n 1)
    local app_dir="src-tauri/target/${target}/release/bundle/macos"

    if [[ -z "$dmg_path" ]]; then
        log_error "Error: ${arch_name} DMG not found"
        exit 1
    fi

    # Create app.tar.gz
    log_step "Creating ${arch_name} updater archive..."
    local app_bundle_path
    app_bundle_path=$(find "$app_dir" -maxdepth 1 -name "*.app" 2>/dev/null | head -n 1)

    if [[ -z "$app_bundle_path" ]] || [[ ! -d "$app_bundle_path" ]]; then
        log_error "Error: ${arch_name} app bundle not found"
        exit 1
    fi

    local app_bundle_name
    app_bundle_name=$(basename "$app_bundle_path")
    local app_tar="${app_dir}/${APP_NAME}_${version}_${arch_name}.app.tar.gz"

    cd "$app_dir"
    COPYFILE_DISABLE=1 tar -czf "$app_tar" \
        --exclude='._*' \
        --exclude='.DS_Store' \
        "$app_bundle_name"
    cd "$REPO_ROOT"

    # Copy artifacts to output directory
    cp "$dmg_path" "${OUTPUT_DIR}/${APP_NAME}_${version}_${arch_name}.dmg"
    cp "$app_tar" "${OUTPUT_DIR}/${APP_NAME}_${version}_${arch_name}.app.tar.gz"

    # Sign update artifact
    local sig_file="${OUTPUT_DIR}/${APP_NAME}_${version}_${arch_name}.app.tar.gz.sig"
    if sign_update_artifact "$app_tar"; then
        if [[ -f "${app_tar}.sig" ]]; then
            cp "${app_tar}.sig" "$sig_file"
        fi
    else
        log_warn "Warning: Skipping signature for ${arch_name} update artifact"
    fi

    # Return signature for latest.json
    if [[ -f "$sig_file" ]]; then
        cat "$sig_file" | tr -d '\n'
    else
        echo ""
    fi
}

# ============================================================================
# Release Artifacts
# ============================================================================

create_latest_json() {
    local version="$1"
    local aarch64_sig="$2"
    local x86_64_sig="$3"

    log_step "Creating latest.json..."

    local pub_date
    pub_date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    cat > "${OUTPUT_DIR}/latest.json" <<EOF
{
  "version": "v${version}",
  "notes": "See the release notes for v${version}",
  "pub_date": "${pub_date}",
  "platforms": {
    "darwin-aarch64": {
      "signature": "${aarch64_sig}",
      "url": "https://github.com/${GITHUB_REPO}/releases/download/v${version}/${APP_NAME}_${version}_aarch64.app.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "${x86_64_sig}",
      "url": "https://github.com/${GITHUB_REPO}/releases/download/v${version}/${APP_NAME}_${version}_x86_64.app.tar.gz"
    }
  }
}
EOF
}

upload_artifacts() {
    local version="$1"

    if [[ "$DRY_RUN" == true ]]; then
        log_step "[DRY RUN] Would upload artifacts to GitHub release v${version}"
        return
    fi

    log_step "Uploading artifacts to GitHub release v${version}..."
    gh release view "v${version}" >/dev/null

    for file in "${OUTPUT_DIR}"/*; do
        if [[ -f "$file" ]]; then
            log_step "  Uploading: $(basename "$file")"
            gh release upload "v${version}" "$file" --clobber
        fi
    done

    log_info "✓ All artifacts uploaded successfully"
}

print_summary() {
    local version="$1"

    log_info "✅ Release process complete!"
    log_info "📁 Artifacts saved in: ${OUTPUT_DIR}/"
    echo ""
    log_step "📦 Release artifacts:"
    ls -lh "$OUTPUT_DIR" | grep -E '\.(dmg|tar\.gz|sig|json)$' | while read -r line; do
        echo "   $line"
    done
    echo ""
    log_warn "📋 Next steps:"
    echo "1. Review the draft release on GitHub"
    echo "2. Test the DMGs (Apple Silicon and Intel)"
    echo "3. Verify auto-updater works with the new signatures (if signed)"
    echo "4. Publish the release when ready"
    echo ""
    log_info "🔗 Release URL: https://github.com/${GITHUB_REPO}/releases/tag/v${version}"
    log_info "🎉 Your macOS apps are ready for distribution!"
}

# ============================================================================
# Main Release Flow
# ============================================================================

run_full_release() {
    log_info "🚀 Starting ${APP_NAME} release process (${RELEASE_TYPE})"

    # Pre-flight checks
    check_prerequisites
    check_signing_key

    # Run tests
    log_step "Running typecheck..."
    pnpm typecheck

    # Check commits since last tag
    check_commits_since_last_tag

    # Version management
    CURRENT_VERSION=$(get_current_version)
    log_info "Current version: ${CURRENT_VERSION}"

    NEW_VERSION=$(calculate_new_version "$CURRENT_VERSION" "$RELEASE_TYPE")
    log_info "New version: ${NEW_VERSION}"

    if [[ "$DRY_RUN" == true ]]; then
        log_step "[DRY RUN] Would bump version: ${CURRENT_VERSION} → ${NEW_VERSION}"
        log_step "[DRY RUN] Would update: package.json, Cargo.toml, CHANGELOG.md"
        log_step "[DRY RUN] Would build aarch64-apple-darwin"
        log_step "[DRY RUN] Would build x86_64-apple-darwin"
        log_step "[DRY RUN] Would sign and upload artifacts"
        log_step "[DRY RUN] Would commit: 'chore: release v${NEW_VERSION}'"
        log_step "[DRY RUN] Would create tag: v${NEW_VERSION}"
        log_step "[DRY RUN] Would push to origin/${MAIN_BRANCH}"
        log_step "[DRY RUN] Would create draft GitHub release: v${NEW_VERSION}"
        echo ""
        log_info "=== DRY RUN COMPLETE - No changes made ==="
        exit 0
    fi

    # Bump version and generate changelog (but don't commit yet!)
    # This allows us to revert if builds fail
    bump_version "$NEW_VERSION"

    log_info "✓ Version bumped to ${NEW_VERSION} (uncommitted)"
    log_info "  Will commit only after successful builds"
}

run_build_only() {
    log_info "🔨 Starting ${APP_NAME} BUILD-ONLY mode"

    check_prerequisites
    check_signing_key

    NEW_VERSION=$(get_current_version)
    verify_build_only_prerequisites "$NEW_VERSION"
}

build_and_upload() {
    # Setup
    ensure_rust_targets
    OUTPUT_DIR="${REPO_ROOT}/release-${NEW_VERSION}"
    mkdir -p "$OUTPUT_DIR"

    # Build for both architectures
    # If this fails, cleanup will revert version changes
    log_info "Building artifacts (this must succeed before committing)..."
    local aarch64_sig x86_64_sig
    aarch64_sig=$(build_for_architecture "aarch64-apple-darwin" "$NEW_VERSION" "aarch64")
    x86_64_sig=$(build_for_architecture "x86_64-apple-darwin" "$NEW_VERSION" "x86_64")

    # Create latest.json
    create_latest_json "$NEW_VERSION" "$aarch64_sig" "$x86_64_sig"

    log_info "✓ All builds completed successfully!"
    log_info "  Now committing and pushing changes..."
}

commit_and_release() {
    local version="$1"

    if [[ "$DRY_RUN" == true ]]; then
        log_step "[DRY RUN] Would commit, tag, push, and create release"
        return
    fi

    # Only commit if we're in full release mode (not build-only)
    if [[ "$BUILD_ONLY" == false ]]; then
        # Commit, tag, and push
        create_release_commit_and_tag "$version"

        # Create GitHub release
        create_github_release "$version"
    fi

    # Upload artifacts
    upload_artifacts "$version"

    # Print summary
    print_summary "$version"

    # Mark that version files are now committed (no need to revert)
    VERSION_FILES_MODIFIED=false
}

# ============================================================================
# Main Entry Point
# ============================================================================

main() {
    cd "$REPO_ROOT"

    parse_arguments "$@"

    if [[ "$BUILD_ONLY" == true ]]; then
        run_build_only
    else
        run_full_release
    fi

    # Build first (this is the risky part - if it fails, version changes are reverted)
    build_and_upload

    # Only commit/push/release if builds succeeded
    commit_and_release "$NEW_VERSION"
}

main "$@"
