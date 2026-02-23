#!/bin/bash
set -euo pipefail

# =================== Obsidian → Website Sync ===================
# Canonical content (source language): content_sync/* (Essays/Notes/Research/Visual)
# Optional translations: content_sync/i18n/<lang>/* (mirrors same folder tree)
# Auto-index rebuild: pages/publications/index.html (lists canonical items)

VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/I/11_Publish"
SITE_ROOT="$HOME/Documents/Site/artan-website"
CONTENT_SYNC_ROOT="$SITE_ROOT/content_sync"
DEST_CANON="$CONTENT_SYNC_ROOT"
PUB_INDEX="$SITE_ROOT/pages/publications/index.html"

VAULT_I18N="$VAULT/i18n"
DEST_I18N="$CONTENT_SYNC_ROOT/i18n"

mkdir -p "$DEST_CANON"

# 1) Mirror Obsidian published content
rsync -av --delete \
  --exclude ".DO_NOT_EDIT" \
  --exclude "DO_NOT_EDIT" \
  --exclude "Do Not Edit" \
  --exclude "README.md" \
  --exclude "i18n/" \
  "$VAULT"/ "$DEST_CANON"/

# 1b) Optional: mirror curated translations (if present)
# Vault layout: 11_Publish/i18n/<lang>/(Essays|Notes|Research|Visual)/...
if [[ -d "$VAULT_I18N" ]]; then
  mkdir -p "$DEST_I18N"

  # Clean removed languages from destination
  for existing in "$DEST_I18N"/*; do
    [[ -d "$existing" ]] || continue
    lang="$(basename "$existing")"
    [[ -d "$VAULT_I18N/$lang" ]] || rm -rf "$existing"
  done

  # Sync each language folder
  for lang_src in "$VAULT_I18N"/*; do
    [[ -d "$lang_src" ]] || continue
    lang="$(basename "$lang_src")"
    mkdir -p "$DEST_I18N/$lang"

    rsync -av --delete \
      --exclude ".DO_NOT_EDIT" \
      --exclude "DO_NOT_EDIT" \
      --exclude "Do Not Edit" \
      --exclude "README.md" \
      "$lang_src"/ "$DEST_I18N/$lang"/
  done
fi

# 2) Rebuild Publications index (YAML-aware: only published publications)
mkdir -p "$(dirname "$PUB_INDEX")"

MD_FILES=()
while IFS= read -r f; do
  MD_FILES+=("$f")
done < <(
  cd "$DEST_CANON" 2>/dev/null || exit 0
  find Essays Notes Research Visual -type f -name "*.md" 2>/dev/null | LC_ALL=C sort
)

extract_yaml_field() {
  local file="$1"
  local field="$2"
  awk -v key="$field:" '
    BEGIN { in_yaml=0 }
    /^---$/ { in_yaml = !in_yaml; next }
    in_yaml && index($0, key)==1 {
      sub(key"[ ]*", "")
      gsub(/^"|"$/, "")
      print
      exit
    }
  ' "$DEST_CANON/$file"
}

LIST_ITEMS=""

for rel in "${MD_FILES[@]}"; do
  type_val="$(extract_yaml_field "$rel" "type")"
  published_val="$(extract_yaml_field "$rel" "published")"

  if [[ "$type_val" != "publication" ]]; then
    continue
  fi

  if [[ "$published_val" != "true" ]]; then
    continue
  fi

  title_val="$(extract_yaml_field "$rel" "title")"
  if [[ -z "$title_val" ]]; then
    continue
  fi

  rel_q="$rel"
  rel_q="${rel_q//%/%25}"
  rel_q="${rel_q// /%20}"
  rel_q="${rel_q//\"/%22}"
  rel_q="${rel_q//#/%23}"
  rel_q="${rel_q//\?/%3F}"
  rel_q="${rel_q//&/%26}"
  href="../../single.html?p=${rel_q}"

  LIST_ITEMS+="      <li class=\"publication-item\">\n"
  LIST_ITEMS+="        <a class=\"publication-link\" href=\"$href\">\n"
  LIST_ITEMS+="          <span class=\"publication-item-title\">$title_val</span>\n"
  LIST_ITEMS+="        </a>\n"
  LIST_ITEMS+="      </li>\n"
done

if [[ -z "$LIST_ITEMS" ]]; then
  LIST_ITEMS="      <li class=\"publication-item publication-item--empty\"><span class=\"publication-empty\" data-i18n-key=\"publications.empty\">No items yet.</span></li>\n"
fi

START_MARK="<!-- PUBLIST:START -->"
END_MARK="<!-- PUBLIST:END -->"

if [[ -f "$PUB_INDEX" ]]; then
  tmp_out="$(mktemp)"
  tmp_list="$(mktemp)"
  printf "%b" "$LIST_ITEMS" > "$tmp_list"

  awk -v START_MARK="$START_MARK" \
      -v END_MARK="$END_MARK" \
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

# 3) Commit and push
cd "$SITE_ROOT"

git add .
if ! git diff --cached --quiet; then
  git commit -m "Auto sync: Obsidian → Website"
  git push origin main
  printf "\n[OK] Synced and rebuilt index.\n"
else
  printf "\n[OK] No changes detected.\n"
fi
