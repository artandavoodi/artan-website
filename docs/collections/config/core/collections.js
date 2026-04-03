/* =================== Collections (Sovereign Module) =================== */
/* Central editorial index for featured blocks across the site.
   Baseline: deterministic curation.
   Forward-compat: schema mirrors Obsidian frontmatter so this file can be replaced
   later by an auto-generated JSON build step sourced from the private vault publishing pipeline.
   

   Stress-test readiness built-in:
   - URL encoding for publication paths
   - Safe fallbacks for missing fields
   - Console warnings for invalid items
*/

(function () {
  "use strict";

  // NOTE: Keep `p` as a RELATIVE path from `content_sync/`.
  // Publications resolve via: single.html?p=<RELATIVE_PATH_FROM_content_sync>
  // Example: { type: "publication", p: "publications/essays/ENGINE.md" }

  // ---------- Helpers (schema + safety) ----------

  function encodeQueryValue(v) {
    // Keep spaces/special chars safe for URLs.
    return encodeURIComponent(String(v || "").trim());
  }

  function filenameToTitle(p) {
    const base = String(p || "")
      .split("/")
      .pop()
      .replace(/\.md$/i, "")
      .replace(/[_-]+/g, " ")
      .trim();

    return base || "Untitled";
  }

  function normalizeItem(item) {
    const it = Object.assign({}, item || {});

    // Canonical fields (aligned with Obsidian frontmatter conventions)
    // title, subtitle, date, cover/icon, tags, lang, featured, status, audience

    if (!it.type) it.type = "link";

    if (it.type === "publication") {
      if (!it.p) {
        console.warn("[collections] publication item missing `p`:", item);
        return null;
      }

      // Fallbacks
      if (!it.title) it.title = filenameToTitle(it.p);
      if (!it.subtitle) it.subtitle = "";
      if (!it.lang) it.lang = "en";

      // Derived href (renderer-friendly)
      it.href = "single.html?p=" + encodeQueryValue(it.p);

      return it;
    }

    // Generic link item
    if (!it.href) {
      console.warn("[collections] link item missing `href`:", item);
      return null;
    }

    if (!it.title) it.title = "Untitled";
    if (!it.subtitle) it.subtitle = "";

    return it;
  }

  function normalizeCollection(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const raw of arr) {
      const it = normalizeItem(raw);
      if (it) out.push(it);
    }
    return out;
  }

  // ---------- Curated Website Collections (Deterministic) ----------

  const COLLECTIONS = {
    // =================== Featured Publications ===================
    featuredPublications: [
      {
        type: "publication",
        p: "publications/essays/ENGINE V2.md",
        title: "ENGINE V2",
        subtitle: "Cognitive architecture and system definition.",
        lang: "en",
        date: "",
        icon: "assets/images/brand/logo.svg",
        tags: ["publication", "systems"],
        status: "active",
        audience: "public"
      },
      {
        type: "publication",
        p: "publications/essays/ENGINE.md",
        title: "ENGINE",
        subtitle: "Foundational publication within the institutional publishing system.",
        lang: "en",
        date: "",
        icon: "assets/images/brand/logo.svg",
        tags: ["publication", "research"],
        status: "active",
        audience: "public"
      }
    ],

    // =================== Featured Notes ===================
    featuredNotes: [
      // Reserved for synced note-type publications and short institutional writing.
    ],

    // =================== Featured Systems ===================
    featuredProducts: [
      // Reserved for platform systems, software modules, and strategic outputs.
    ],

    // =================== Featured Updates ===================
    featuredUpdates: [
      // Reserved for announcements, updates, and release-signals once sync paths are expanded.
    ]
  };

  // ---------- Public API (non-module script) ----------

  function getCollection(name) {
    return Array.isArray(COLLECTIONS[name]) ? COLLECTIONS[name].slice() : [];
  }

  function getCollectionNormalized(name) {
    return normalizeCollection(getCollection(name));
  }

  // Expose
  window.COLLECTIONS = COLLECTIONS;
  window.getCollection = getCollection;
  window.getCollectionNormalized = getCollectionNormalized;
})();