import { applyTokenCSS } from "./token-bridge.js";

export class DSCRuntime {
  async load() {
    const [registry, tokens, themes] = await Promise.all([
      fetch('/design-system-core/registry/core.registry.json').then(r => r.json()),
      fetch('/design-system-core/tokens/tokens.json').then(r => r.json()),
      fetch('/design-system-core/themes/themes.json').then(r => r.json())
    ]);

    this.registry = registry;
    this.tokens = tokens;
    this.themes = themes;

    applyTokenCSS(tokens);
    this.bindTheme();
  }

  bindTheme() {
    const theme = this.themes?.active || "default";
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export const dscRuntime = new DSCRuntime();
