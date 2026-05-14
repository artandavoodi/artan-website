window.addEventListener("CC_TOKEN_UPDATED", (event) => {
  const { id, value } = event.detail;

  if (id && value) {
    document.documentElement.style.setProperty(
      `--${id.replace(/\./g, "-")}`,
      value
    );
  }

  console.log("[CC TOKEN UPDATED]", event.detail);
});

window.addEventListener("CC_THEME_CHANGED", (event) => {
  document.documentElement.dataset.ccTheme =
    event.detail.id || "default";

  console.log("[CC THEME CHANGED]", event.detail);
});

window.addEventListener("CC_ICON_REGISTERED", (event) => {
  console.log("[CC ICON REGISTERED]", event.detail);
});
