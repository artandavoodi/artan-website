window.addEventListener("CC_TOKEN_UPDATED", (event) => {

  const { id, value } = event.detail;

  if (!id || !value) {
    return;
  }

  document.documentElement.style.setProperty(
    `--${id.replace(/\./g, "-")}`,
    value
  );

  console.log(
    "[CONTROL CENTER TOKEN PROPAGATED]",
    id,
    value
  );

});

window.addEventListener("CC_THEME_CHANGED", (event) => {

  document.documentElement.dataset.ccTheme =
    event.detail.id || "default";

  console.log(
    "[CONTROL CENTER THEME PROPAGATED]",
    event.detail
  );

});

window.dispatchEvent(
  new CustomEvent("CC_TOKEN_UPDATED", {
    detail: {
      id: "surface.background",
      value: "#151618"
    }
  })
);

window.dispatchEvent(
  new CustomEvent("CC_THEME_CHANGED", {
    detail: {
      id: "control-center-live"
    }
  })
);
