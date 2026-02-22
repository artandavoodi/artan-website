
#!/bin/bash
set -euo pipefail

# =================== Obsidian → Website Sync ===================
# Source of truth: Obsidian vault 11_Publish
# Mirror:          website/content_sync/en (canonical)
# Auto-index:      rebuild pages/publications/index.html from mirrored files

VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/I/11_Publish"
SITE_ROOT="$HOME/Documents/Site/artan-website"
CONTENT_SYNC_ROOT="$SITE_ROOT/content_sync"
DEST_EN="$CONTENT_SYNC_ROOT/en"
PUB_INDEX="$SITE_ROOT/pages/publications/index.html"

mkdir -p "$DEST_EN"

# Canonical content lives under content_sync/en (other languages may be added as content_sync/<lang>/...)
# 1) Mirror published content into the website repo
rsync -av --delete \
  --exclude ".DO_NOT_EDIT" \
  --exclude "DO_NOT_EDIT" \
  --exclude "Do Not Edit" \
  --exclude "README.md" \
  "$VAULT"/ "$DEST_EN"/

# 2) Auto-build Publications index from current content_sync tree
#    - Uses single.html renderer
#    - Lists all .md under: Essays, Notes, Research, Visual
#    - Stable ordering (alpha)
#    - Generates clean titles from filename

mkdir -p "$(dirname "$PUB_INDEX")"

# Collect markdown files (relative paths from content_sync)
MD_FILES=()
while IFS= read -r f; do
  MD_FILES+=("$f")
done < <(
  cd "$DEST_EN" 2>/dev/null || exit 0
  find Essays Notes Research Visual -type f -name "*.md" 2>/dev/null | LC_ALL=C sort
)

title_from_filename() {
  local f="$1"
  local base
  base="$(basename "$f")"
  base="${base%.md}"
  # Replace separators with spaces, then Title Case (simple)
  base="${base//_/ }"
  base="${base//-/ }"
  # Collapse multiple spaces
  base="$(echo "$base" | tr -s ' ' )"
  # Title case each word
  echo "$base" | awk '{ for (i=1;i<=NF;i++){ $i=toupper(substr($i,1,1)) substr($i,2) } }1'
}

# Build list items (structure matches publication.css expectations)
LIST_ITEMS=""
for rel in "${MD_FILES[@]}"; do
  t="$(title_from_filename "$rel")"

  # Minimal URL encoding for query param (spaces only)
  rel_q="${rel// /%20}"
  href="../../single.html?p=${rel_q}"

  LIST_ITEMS+=$(printf '      <li class="publication-item">\n')
  LIST_ITEMS+=$(printf '        <a class="publication-link" href="%s">\n' "$href")
  LIST_ITEMS+=$(printf '          <span class="publication-item-title">%s</span>\n' "$t")
  LIST_ITEMS+=$(printf '        </a>\n')
  LIST_ITEMS+=$(printf '      </li>\n')
done

# If any upstream step ever introduced literal backslash-n sequences, normalize them.
LIST_ITEMS="${LIST_ITEMS//\\n/$'\n'}"

# Empty state (keeps layout stable)
if [[ ${#MD_FILES[@]} -eq 0 ]]; then
  LIST_ITEMS=$'      <li class="publication-item publication-item--empty"><span class="publication-empty" data-i18n-key="publications.empty">No items yet.</span></li>\n'
fi

cat > "$PUB_INDEX" <<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- =================== Basic Meta =================== -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Publications • Artan</title>

  <link rel="icon" type="image/png" sizes="16x16" href="../../assets/icons/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../../assets/icons/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../../assets/icons/apple-touch-icon.png">
  <link rel="icon" type="image/svg+xml" href="../../assets/icons/favicon.svg">

  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="stylesheet" href="../../assets/css/components.css">
  <link rel="stylesheet" href="../../assets/css/menu.css">
  <link rel="stylesheet" href="../../assets/css/country-overlay.css">
  <link rel="stylesheet" href="../../assets/css/publication.css">

  <!-- =================== Fonts =================== -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body class="site-body">

  <!-- =================== Custom Cursor =================== -->
  <div class="custom-cursor"></div>

  <!-- =================== Header Controls =================== -->
  <header id="header-controls" class="site-header">
    <button id="menu-button" aria-label="Open menu">
      <span class="line line-top"></span>
      <span class="line line-bottom"></span>
    </button>
  </header>

  <!-- =================== Publications Main =================== -->
  <main class="publication-main" id="publications">
    <h1 class="publication-heading" data-i18n-key="publications.title">Publications</h1>
    <p class="publication-sub" data-i18n-key="publications.subtitle">A living index of essays, notes, research, and visual studies.</p>

    <ul class="publication-list" aria-label="Publications list">
${LIST_ITEMS}    </ul>
  </main>

  <!-- =================== Footer =================== -->
  <footer class="site-footer">
    <div class="footer-flex">
      <div class="footer-left">© 2026 ARTAN</div>

      <div class="footer-locale">
        <div class="locale-item">
          <button id="language-toggle" class="locale-button" aria-label="Select language" data-locale-trigger="language">
            <span id="current-language">—</span>
          </button>
          <div id="language-dropdown" class="language-dropdown" aria-hidden="true"></div>
        </div>

        <span class="footer-separator-dot">•</span>

        <div class="locale-item">
          <button id="country-selector" class="locale-button" aria-label="Select country" data-locale-trigger="country">
            <span id="current-country">—</span>
          </button>
        </div>
      </div>
    </div>
  </footer>

  <!-- =================== Country/Region Overlay =================== -->
  <div id="country-overlay" class="country-overlay" aria-hidden="true">
    <div class="country-overlay-inner">
      <div class="overlay-header-container">
        <h2 class="country-overlay-title" data-i18n-key="overlay.chooseRegion">Choose your country or region</h2>
        <button id="country-overlay-close" class="global-close-button" aria-label="Close country selector">
          <span></span>
          <span></span>
        </button>
      </div>
      <hr class="footer-separator">
      <div id="country-regions"></div>
    </div>
  </div>

  <!-- =================== Menu Overlay =================== -->
  <div id="menu-overlay" class="menu-overlay" aria-hidden="true" data-pack-state="music">
    <div class="menu-overlay-inner">
      <div class="menu-wrapper">
        <button id="menu-pack-toggle" class="menu-pack-toggle" aria-label="Toggle social / music" aria-pressed="false" type="button">
          <img src="../../assets/icons/utilities/hover-to-social-media-and-music.svg" alt="" aria-hidden="true">
        </button>
        <div class="menu-columns">
          <div class="menu-col-a">
            <div class="menu-col-a-section-a">
              <div class="menu-controls">
                <a class="menu-control-icon" aria-label="Profile" href="../../profile.html">
                  <img src="../../assets/icons/utilities/profile.svg" alt="" aria-hidden="true">
                </a>
                <a class="menu-control-icon" aria-label="Email" href="#" data-contact="email">
                  <img src="../../assets/icons/utilities/email-me.svg" alt="" aria-hidden="true">
                </a>
                <button id="theme-toggle" class="menu-control-icon theme-toggle" aria-label="Toggle dark and light mode" type="button"></button>
              </div>
              <div class="menu-packs-split" aria-label="Links">
                <div class="menu-pack-slot" data-pack-slot="music">
                  <div id="menu-pack-music" class="menu-pack" data-pack="music" aria-label="Music platforms" aria-hidden="false">
                    <a class="menu-pack-icon" aria-label="Apple Music" href="https://music.apple.com/de/artist/artan/1855183543?l=en-GB" data-stream="apple-music">
                      <img class="menu-pack-img" src="../../assets/icons/brands/apple-music.svg" alt="" aria-hidden="true">
                    </a>
                    <a class="menu-pack-icon" aria-label="Spotify" href="https://open.spotify.com/artist/4MSdNxckTdTdVQFWtB2OFR" data-stream="spotify">
                      <img class="menu-pack-img" src="../../assets/icons/brands/spotify.svg" alt="" aria-hidden="true">
                    </a>
                    <a class="menu-pack-icon" aria-label="SoundCloud" href="https://soundcloud.com/artandavoodi" data-stream="soundcloud">
                      <img class="menu-pack-img" src="../../assets/icons/brands/soundcloud.svg" alt="" aria-hidden="true">
                    </a>
                  </div>
                </div>
                <div class="menu-pack-slot" data-pack-slot="social">
                  <div id="menu-pack-social" class="menu-pack" data-pack="social" aria-label="Social" aria-hidden="true">
                    <a class="menu-pack-icon" aria-label="YouTube" href="https://www.youtube.com/@artandavoodi" data-social="youtube">
                      <img class="menu-pack-img" src="../../assets/icons/brands/youtube.svg" alt="" aria-hidden="true">
                    </a>
                    <a class="menu-pack-icon" aria-label="Instagram" href="https://www.instagram.com/artandavoodi/" data-social="instagram">
                      <img class="menu-pack-img" src="../../assets/icons/brands/instagram.svg" alt="" aria-hidden="true">
                    </a>
                    <a class="menu-pack-icon" aria-label="TikTok" href="https://www.tiktok.com/@artan.davoodi" data-social="tiktok">
                      <img class="menu-pack-img" src="../../assets/icons/brands/tiktok.svg" alt="" aria-hidden="true">
                    </a>
                    <a class="menu-pack-icon" aria-label="X" href="https://x.com/artandavoodi" data-social="x">
                      <img class="menu-pack-img" src="../../assets/icons/brands/x.svg" alt="" aria-hidden="true">
                    </a>
                  </div>
                </div>
              </div>
              <div class="menu-plain-logo-wrap">
                <img src="../../assets/icons/artan-logos/logo-plain.svg" alt="Artan" class="menu-plain-logo">
              </div>
            </div>
            <div class="menu-col-a-sep" aria-hidden="true"></div>
            <div class="menu-col-a-section-b" aria-label="Identity">
              <img src="../../assets/icons/artan-logos/logo-typo.svg" alt="ARTAN" class="menu-typo-logo">
              <p class="menu-site-essence" data-i18n-key="site.essence">SOUND • VISUAL • CONSCIOUSNESS</p>
            </div>
          </div>
          <div class="menu-col-b">
            <div class="menu-col-b-section-a" aria-label="Menu preview">
              <div class="menu-preview" aria-label="Preview">
                <h3 id="menu-preview-title" class="menu-preview-title">
                  <img id="menu-preview-icon" class="menu-preview-icon" src="../../assets/icons/utilities/music.svg" alt="" aria-hidden="true" data-preview-icon-default="../../assets/icons/utilities/music.svg">
                  <span id="menu-preview-title-text" class="menu-preview-title-text sr-only" data-i18n-key="menu.preview.title">Music</span>
                </h3>
                <p id="menu-preview-sub" class="menu-preview-sub" data-i18n-key="menu.preview.sub">Sound as structure and intention</p>
              </div>
            </div>
            <div class="menu-col-b-section-b" aria-label="Menu list">
              <ul class="menu-list" aria-label="Primary">
                <li class="menu-sep" aria-hidden="true"></li>
                <li class="menu-item" data-preview-title="MUSIC" data-preview-sub="Sound as structure and intention" data-preview-icon="../../assets/icons/utilities/music.svg">
                  <a href="../music/index.html" class="menu-link menu-link--nojump" data-text="Music" data-i18n-key="menu.music"><span class="menu-link-inner"><span class="menu-link-text">Music</span></span></a>
                </li>
                <li class="menu-sep" aria-hidden="true"></li>
                <li class="menu-item" data-preview-title="BOOKS" data-preview-sub="Thought refined into language" data-preview-icon="../../assets/icons/utilities/book.svg">
                  <a href="../books/index.html" class="menu-link menu-link--nojump" data-text="Books" data-i18n-key="menu.books"><span class="menu-link-inner"><span class="menu-link-text">Books</span></span></a>
                </li>
                <li class="menu-sep" aria-hidden="true"></li>
                <li class="menu-item" data-preview-title="EVENTS" data-preview-sub="Presence shared in time" data-preview-icon="../../assets/icons/utilities/event.svg">
                  <a href="../events/index.html" class="menu-link menu-link--nojump" data-text="Events" data-i18n-key="menu.events"><span class="menu-link-inner"><span class="menu-link-text">Events</span></span></a>
                </li>
                <li class="menu-sep" aria-hidden="true"></li>
                <li class="menu-item" data-preview-title="PROJECTS" data-preview-sub="Ideas shaped into systems" data-preview-icon="../../assets/icons/utilities/project.svg">
                  <a href="../projects/awareness/index.html" class="menu-link menu-link--nojump" data-text="Projects" data-i18n-key="menu.projects"><span class="menu-link-inner"><span class="menu-link-text">Projects</span></span></a>
                </li>
                <li class="menu-sep" aria-hidden="true"></li>
                <li class="menu-item" data-preview-title="PRODUCTS" data-preview-sub="Form reduced to purpose" data-preview-icon="../../assets/icons/utilities/product.svg">
                  <a href="../products/index.html" class="menu-link menu-link--nojump" data-text="Products" data-i18n-key="menu.products"><span class="menu-link-inner"><span class="menu-link-text">Products</span></span></a>
                </li>
                <li class="menu-sep" aria-hidden="true"></li>
                <li class="menu-item" data-preview-title="GALLERY" data-preview-sub="Images held in stillness" data-preview-icon="../../assets/icons/utilities/gallery.svg">
                  <a href="../gallery/index.html" class="menu-link menu-link--nojump" data-text="Gallery" data-i18n-key="menu.gallery"><span class="menu-link-inner"><span class="menu-link-text">Gallery</span></span></a>
                </li>
                <li class="menu-sep" aria-hidden="true"></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- =================== Scripts =================== -->
  <script src="../../assets/js/ia.js" defer></script>
  <script src="../../assets/js/darkmode.js" defer></script>
  <script src="../../assets/js/countries.js" defer></script>
  <script src="../../assets/js/translation.js" defer></script>
  <script src="../../assets/js/country-language.js" defer></script>
  <script src="../../assets/js/menu.js" defer></script>
  <script src="../../assets/js/main.js" defer></script>

</body>
</html>
HTML


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
