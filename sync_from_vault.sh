#!/bin/bash
set -euo pipefail

VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/I/11_Publish"
DEST="$HOME/Documents/Site/artan-website/content_sync"

mkdir -p "$DEST"
rsync -av --delete \
  --exclude ".DO_NOT_EDIT" \
  --exclude "DO_NOT_EDIT" \
  --exclude "Do Not Edit" \
  --exclude "README.md" \
  "$VAULT"/ "$DEST"/
