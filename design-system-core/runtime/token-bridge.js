export function applyTokenCSS(tokens) {
  const root = document.documentElement;

  for (const [k,v] of Object.entries(tokens.colors || {})) {
    root.style.setProperty(`--color-${k}`, v);
  }

  for (const [k,v] of Object.entries(tokens.spacing || {})) {
    root.style.setProperty(`--space-${k}`, v);
  }

  for (const [k,v] of Object.entries(tokens.radius || {})) {
    root.style.setProperty(`--radius-${k}`, v);
  }
}
