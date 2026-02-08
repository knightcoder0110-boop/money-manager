# Versioning Guide

## Format: `MAJOR.MINOR.PATCH` (e.g. 1.2.3)

## Workflow

1. Make your changes
2. Commit your code
3. Run the bump script
4. Push

```bash
# Example: you fixed a bug
git add . && git commit -m "fix: transaction not saving"
./scripts/bump.sh patch
git push && git push --tags
```

## When to use what

### `./scripts/bump.sh patch` → 1.0.0 becomes 1.0.1

Use for small, safe changes that don't add anything new.

- Bug fixes
- Typo fixes
- Style tweaks (padding, colors, font size)
- Fixing a broken API response
- Updating error messages
- Performance fix

### `./scripts/bump.sh minor` → 1.0.0 becomes 1.1.0

Use when you add something new or change existing behavior.

- New screen or page
- New API endpoint
- New feature (e.g. added streaks, added events)
- UI redesign of a single screen
- Added a new filter or sort option
- New category icons or themes

### `./scripts/bump.sh major` → 1.0.0 becomes 2.0.0

Use when things break if someone doesn't update.

- Database migration that changes table structure
- API endpoint URL or response format changes
- Auth system change
- Dropped support for old app versions
- Full app rewrite or navigation overhaul

## What the script updates

- `version.json` (source of truth)
- `package.json` (web app)
- `mobile/package.json` (mobile app)
- `mobile/app.json` (Expo/EAS builds)
- Creates git tag `v1.2.3`

## Rules

1. Bump **after** committing your changes, not before
2. One bump per release, not per commit
3. If you made both a bug fix AND a new feature, use `minor` (pick the highest)
4. Don't skip versions — always bump from current
