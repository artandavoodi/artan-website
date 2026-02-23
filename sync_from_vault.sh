#!/bin/bash
set -euo pipefail

# =================== Obsidian → Website Sync ===================
# Source of truth: Obsidian vault 11_Publish
# Mirror:          website/content_sync/en (canonical)
# Auto-index:      rebuild pages/publications/index.html from mirrored files

VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/I/11_Publish"
SITE_ROOT="$HOME/Documents/Site/artan-website"
CONTENT_SYNC_ROOT="$SITE_ROOT/content_sync"
DEST_CANON="$CONTENT_SYNC_ROOT"
PUB_INDEX="$SITE_ROOT/pages/publications/index.html"

mkdir -p "$DEST_CANON"

# 1) Mirror published content into the website repo
rsync -av --delete \
  --exclude ".DO_NOT_EDIT" \
  --exclude "DO_NOT_EDIT" \
  --exclude "Do Not Edit" \
  --exclude "README.md" \
  "$VAULT"/ "$DEST_CANON"/

# 2) Auto-build Publications index from current content_sync tree
mkdir -p "$(dirname "$PUB_INDEX")"

MD_FILES=()
while IFS= read -r f; do
  MD_FILES+=("$f")
done < <(
  cd "$DEST_CANON" 2>/dev/null || exit 0
  find Essays Notes Research Visual -type f -name "*.md" 2>/dev/null | LC_ALL=C sort
)

title_from_filename() {
  local f="$1"
  local base
  base="$(basename "$f")"
  base="${base%.md}"
  base="${base//_/ }"
  base="${base//-/ }"
  base="$(echo "$base" | tr -s ' ' )"
  echo "$base" | awk '{ for (i=1;i<=NF;i++){ $i=toupper(substr($i,1,1)) substr($i,2) } }1'
}

LIST_ITEMS=""
for rel in "${MD_FILES[@]}"; do
  t="$(title_from_filename "$rel")"
  rel_q="${rel// /%20}"
  href="../../single.html?p=${rel_q}"

  LIST_ITEMS+=$(printf '      <li class="publication-item">\n')
  LIST_ITEMS+=$(printf '        <a class="publication-link" href="%s">\n' "$href")
  LIST_ITEMS+=$(printf '          <span class="publication-item-title">%s</span>\n' "$t")
  LIST_ITEMS+=$(printf '        </a>\n')
  LIST_ITEMS+=$(printf '      </li>\n')
done

LIST_ITEMS="${LIST_ITEMS//\\n/$'\n'}"

if [[ ${#MD_FILES[@]} -eq 0 ]]; then
  LIST_ITEMS=$'      <li class="publication-item publication-item--empty"><span class="publication-empty" data-i18n-key="publications.empty">No items yet.</span></li>\n'
fi

if [[ -f "$PUB_INDEX" ]]; then
  tmp_out="$(mktemp)"
  tmp_list="$(mktemp)"
  printf "%s" "$LIST_ITEMS" > "$tmp_list"

  awk -v START_MARK="<!-- PUBLIST:START -->" \
      -v END_MARK="<!-- PUBLIST:END -->" \
      -v LIST_FILE="$tmp_list" '
    BEGIN { inblock=0 }
    {
      if (index($0, START_MARK)) {
        print $0
        while ((getline l < LIST_FILE) > 0) print l
        close(LIST_FILE)
        inblock=1
        next
      }
      if (inblock) {
        if (index($0, END_MARK)) {
          print $0
          inblock=0
        }
        next
      }
      print $0
    }
  ' "$PUB_INDEX" > "$tmp_out"

  mv "$tmp_out" "$PUB_INDEX"
  rm -f "$tmp_list"
fi

# 3) Auto-commit and push website changes
cd "$SITE_ROOT"

git add .
if ! git diff --cached --quiet; then
  git commit -m "Auto sync: Obsidian → Website"
  git push origin main
  printf "\n[OK] Synced, rebuilt index, committed, and pushed to GitHub.\n"
else
  printf "\n[OK] No changes detected. Sync complete.\n"
fi
