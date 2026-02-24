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

slugify_fallback() {
  # Lowercase, spaces/underscores → hyphen, drop non-url-safe chars, collapse hyphens
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[ _]+/-/g; s/[^a-z0-9-]+//g; s/-+/-/g; s/^-|-$//g'
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

  slug_val="$(extract_yaml_field "$rel" "slug")"
  if [[ -z "$slug_val" ]]; then
    base_name="$(basename "$rel")"
    base_name="${base_name%.md}"
    slug_val="$(slugify_fallback "$base_name")"
  fi

  href="/publications/${slug_val}/"

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


# 2b) Build static publication pages + sitemap block (SEO-friendly)
# Output: /publications/<slug>/index.html
PUB_PAGES_DIR="$SITE_ROOT/publications"
SITEMAP_FILE="$SITE_ROOT/sitemap.xml"

# Simple, dependency-free markdown → HTML (headings, paragraphs, bullet lists, blockquotes, code fences)
md_to_html() {
  awk '
    function esc(s){ gsub(/&/,"&amp;",s); gsub(/</,"&lt;",s); gsub(/>/,"&gt;",s); return s }
    BEGIN{ in_list=0; in_code=0; in_quote=0 }
    /^```/ {
      if(in_code){ print "</code></pre>"; in_code=0 } else { print "<pre><code>"; in_code=1 }
      next
    }
    {
      if(in_code){ print esc($0); next }
    }
    /^> / {
      if(!in_quote){ print "<blockquote>"; in_quote=1 }
      line=$0; sub(/^> /,"",line)
      print "<p>" esc(line) "</p>"
      next
    }
    !/^> / {
      if(in_quote){ print "</blockquote>"; in_quote=0 }
    }
    /^\s*$/ {
      if(in_list){ print "</ul>"; in_list=0 }
      next
    }
    /^- / {
      if(!in_list){ print "<ul>"; in_list=1 }
      line=$0; sub(/^- /,"",line)
      print "<li>" esc(line) "</li>"
      next
    }
    /^###### /{ if(in_list){ print "</ul>"; in_list=0 } line=$0; sub(/^###### /,"",line); print "<h6>" esc(line) "</h6>"; next }
    /^##### / { if(in_list){ print "</ul>"; in_list=0 } line=$0; sub(/^##### /,"",line); print "<h5>" esc(line) "</h5>"; next }
    /^#### /  { if(in_list){ print "</ul>"; in_list=0 } line=$0; sub(/^#### /,"",line); print "<h4>" esc(line) "</h4>"; next }
    /^### /   { if(in_list){ print "</ul>"; in_list=0 } line=$0; sub(/^### /,"",line); print "<h3>" esc(line) "</h3>"; next }
    /^## /    { if(in_list){ print "</ul>"; in_list=0 } line=$0; sub(/^## /,"",line); print "<h2>" esc(line) "</h2>"; next }
    /^# /     { if(in_list){ print "</ul>"; in_list=0 } line=$0; sub(/^# /,"",line);  print "<h1>" esc(line) "</h1>"; next }
    {
      if(in_list){ print "</ul>"; in_list=0 }
      print "<p>" esc($0) "</p>"
    }
    END{
      if(in_list) print "</ul>"
      if(in_quote) print "</blockquote>"
      if(in_code) print "</code></pre>"
    }
  '
}

extract_body_without_yaml() {
  awk '
    BEGIN{ in_yaml=0; started=0 }
    /^---$/ {
      if(!started){ in_yaml=1; started=1; next }
      if(in_yaml){ in_yaml=0; next }
    }
    { if(!in_yaml) print }
  ' "$1"
}

slugify_fallback() {
  # Lowercase, spaces/underscores → hyphen, drop non-url-safe chars, collapse hyphens
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[ _]+/-/g; s/[^a-z0-9-]+//g; s/-+/-/g; s/^-|-$//g'
}

mkdir -p "$PUB_PAGES_DIR"

# Build pages and collect sitemap URLs
SITEMAP_URLS=""
SITE_BASE="https://artan.live"

for rel in "${MD_FILES[@]}"; do
  type_val="$(extract_yaml_field "$rel" "type")"
  published_val="$(extract_yaml_field "$rel" "published")"

  [[ "$type_val" == "publication" ]] || continue
  [[ "$published_val" == "true" ]] || continue

  title_val="$(extract_yaml_field "$rel" "title")"
  subtitle_val="$(extract_yaml_field "$rel" "subtitle")"
  slug_val="$(extract_yaml_field "$rel" "slug")"

  # Required fields
  [[ -n "$title_val" ]] || continue

  if [[ -z "$slug_val" ]]; then
    # Fallback to filename if slug not set
    base_name="$(basename "$rel")"
    base_name="${base_name%.md}"
    slug_val="$(slugify_fallback "$base_name")"
  fi

  out_dir="$PUB_PAGES_DIR/$slug_val"
  out_file="$out_dir/index.html"
  mkdir -p "$out_dir"

  src_file="$DEST_CANON/$rel"
  body_md="$(mktemp)"
  body_html="$(mktemp)"
  extract_body_without_yaml "$src_file" > "$body_md"
  md_to_html < "$body_md" > "$body_html"

  # Relative paths from /publications/<slug>/index.html → site root
  ASSET_PREFIX="../../"

  cat > "$out_file" <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title_val} • Artan</title>

  <link rel="icon" type="image/png" sizes="16x16" href="${ASSET_PREFIX}assets/icons/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="${ASSET_PREFIX}assets/icons/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${ASSET_PREFIX}assets/icons/apple-touch-icon.png">
  <link rel="icon" type="image/svg+xml" href="${ASSET_PREFIX}assets/icons/favicon.svg">

  <link rel="stylesheet" href="${ASSET_PREFIX}assets/css/style.css">
  <link rel="stylesheet" href="${ASSET_PREFIX}assets/css/components.css">
  <link rel="stylesheet" href="${ASSET_PREFIX}assets/css/menu.css">
  <link rel="stylesheet" href="${ASSET_PREFIX}assets/css/country-overlay.css">
  <link rel="stylesheet" href="${ASSET_PREFIX}assets/css/publication.css">

  <link rel="canonical" href="${SITE_BASE}/publications/${slug_val}/">

  <meta property="og:title" content="${title_val}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE_BASE}/publications/${slug_val}/">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body class="site-body">

  <div class="custom-cursor"></div>

  <header id="header-controls" class="site-header">
    <button id="menu-button" aria-label="Open menu">
      <span class="line line-top"></span>
      <span class="line line-bottom"></span>
    </button>
  </header>

  <!-- =================== Menu Mount =================== -->
  <div id="menu-mount"></div>

  <main class="publication-main home-inner home-rail" id="publication">
    <h1 class="publication-heading">${title_val}</h1>
EOF

  if [[ -n "$subtitle_val" ]]; then
    printf "    <p class=\"publication-sub\">%s</p>\n" "$subtitle_val" >> "$out_file"
  fi

  cat >> "$out_file" <<EOF
    <div class="publication-body">
EOF

  cat "$body_html" >> "$out_file"

  cat >> "$out_file" <<EOF
    </div>
  </main>

  <!-- =================== Footer Mount =================== -->
  <div id="footer-mount"></div>

  <!-- =================== Country Overlay Mount =================== -->
  <div id="country-overlay-mount"></div>

  <script src="${ASSET_PREFIX}assets/js/ia.js" defer></script>
  <script src="${ASSET_PREFIX}assets/js/darkmode.js" defer></script>
  <script src="${ASSET_PREFIX}assets/js/countries.js" defer></script>
  <script src="${ASSET_PREFIX}assets/js/translation.js" defer></script>
  <script src="${ASSET_PREFIX}assets/js/country-language.js" defer></script>
  <script src="${ASSET_PREFIX}assets/js/menu.js" defer></script>
  <script src="${ASSET_PREFIX}assets/js/main.js" defer></script>

</body>
</html>
EOF

  rm -f "$body_md" "$body_html"

  SITEMAP_URLS+="  <url><loc>${SITE_BASE}/publications/${slug_val}/</loc></url>\n"

done

# Maintain sitemap block if sitemap.xml exists
SITEMAP_START="<!-- PUBS:START -->"
SITEMAP_END="<!-- PUBS:END -->"
if [[ -f "$SITEMAP_FILE" ]]; then
  tmp_sm="$(mktemp)"
  awk -v START="$SITEMAP_START" -v END_MARK="$SITEMAP_END" -v URLS="$SITEMAP_URLS" '
    BEGIN{inblock=0}
    {
      if(index($0, START)){
        print $0
        printf "%b", URLS
        inblock=1
        next
      }
      if(inblock){
        if(index($0, END_MARK)){ print $0; inblock=0 }
        next
      }
      print $0
    }
  ' "$SITEMAP_FILE" > "$tmp_sm"
  mv "$tmp_sm" "$SITEMAP_FILE"
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
