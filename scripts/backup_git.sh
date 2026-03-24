#!/usr/bin/env bash
# backup_git.sh — copies .git to .backup/git_<timestamp>
# Run from the repo root after every commit.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$REPO_ROOT/.backup"
mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DEST="$BACKUP_DIR/git_$TIMESTAMP"

cp -r "$REPO_ROOT/.git" "$DEST"
echo "[backup] .git → $DEST"

# Keep only the 10 most recent backups to avoid unbounded disk growth
cd "$BACKUP_DIR"
ls -1dt git_* 2>/dev/null | tail -n +11 | xargs -r rm -rf
