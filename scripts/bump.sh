#!/bin/bash
#
# Version Bump Script for Money Manager
#
# Usage:
#   ./scripts/bump.sh patch    → 1.0.0 → 1.0.1  (bug fixes, small tweaks)
#   ./scripts/bump.sh minor    → 1.0.0 → 1.1.0  (new features, UI changes)
#   ./scripts/bump.sh major    → 1.0.0 → 2.0.0  (breaking changes, rewrites)
#
# What it does:
#   1. Reads current version from version.json
#   2. Bumps the version based on the argument
#   3. Updates version.json, package.json, mobile/package.json, mobile/app.json
#   4. Creates a git commit and tag
#

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# --- Validate input ---
BUMP_TYPE="$1"
if [[ "$BUMP_TYPE" != "patch" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "major" ]]; then
  echo ""
  echo "  Usage: ./scripts/bump.sh <patch|minor|major>"
  echo ""
  echo "  patch  → bug fixes, typos, small tweaks"
  echo "  minor  → new features, UI changes, API additions"
  echo "  major  → breaking changes, big rewrites"
  echo ""
  exit 1
fi

# --- Read current version ---
CURRENT_VERSION=$(grep '"version"' "$ROOT_DIR/version.json" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')

if [[ -z "$CURRENT_VERSION" ]]; then
  echo "Error: Could not read version from version.json"
  exit 1
fi

# --- Calculate new version ---
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

case "$BUMP_TYPE" in
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

echo ""
echo "  Bumping version: $CURRENT_VERSION → $NEW_VERSION ($BUMP_TYPE)"
echo ""

# --- Update version.json ---
cat > "$ROOT_DIR/version.json" << EOF
{
  "version": "$NEW_VERSION"
}
EOF
echo "  Updated version.json"

# --- Update root package.json ---
if [[ -f "$ROOT_DIR/package.json" ]]; then
  sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$ROOT_DIR/package.json"
  echo "  Updated package.json"
fi

# --- Update mobile/package.json ---
if [[ -f "$ROOT_DIR/mobile/package.json" ]]; then
  sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$ROOT_DIR/mobile/package.json"
  echo "  Updated mobile/package.json"
fi

# --- Update mobile/app.json ---
if [[ -f "$ROOT_DIR/mobile/app.json" ]]; then
  sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$ROOT_DIR/mobile/app.json"
  echo "  Updated mobile/app.json"
fi

echo ""

# --- Git commit and tag ---
read -p "  Create git commit and tag v$NEW_VERSION? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  cd "$ROOT_DIR"
  git add version.json package.json mobile/package.json mobile/app.json
  git commit -m "chore: bump version to $NEW_VERSION"
  git tag "v$NEW_VERSION"
  echo ""
  echo "  Committed and tagged v$NEW_VERSION"
  echo "  Run 'git push && git push --tags' to push"
else
  echo ""
  echo "  Files updated but not committed."
  echo "  Don't forget to commit when ready!"
fi

echo ""
