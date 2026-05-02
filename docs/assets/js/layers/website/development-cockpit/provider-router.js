/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) IMPORTS
   03) RENDERING
   04) INITIALIZATION
   05) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/development-cockpit/provider-router.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  getCockpitModuleRoot,
  normalizeCockpitString,
  writeCockpitOutput
} from './development-cockpit-shell.js';

/* =============================================================================
   03) RENDERING
============================================================================= */
function renderProviderButton(provider) {
  const button = document.createElement('button');
  button.className = 'provider-router__option';
  button.type = 'button';
  button.dataset.providerId = normalizeCockpitString(provider.id);
  button.innerHTML = `
    <strong>${normalizeCockpitString(provider.label)}</strong>
    <span>${normalizeCockpitString(provider.mode)} · ${normalizeCockpitString(provider.status)}</span>
    <span>${normalizeCockpitString(provider.description)}</span>
  `;
  return button;
}

/* =============================================================================
   04) INITIALIZATION
============================================================================= */
export function initProviderRouter(context) {
  const root = getCockpitModuleRoot(context, 'provider-router');
  const list = root?.querySelector('[data-provider-router-list]');
  if (!root || !list) return;

  const providers = Array.isArray(context.registries.providers?.providers)
    ? context.registries.providers.providers
    : [];

  list.innerHTML = '';
  providers.forEach((provider, index) => {
    const button = renderProviderButton(provider);
    if (index === 0) {
      button.setAttribute('aria-pressed', 'true');
      writeCockpitOutput(root, '[data-provider-router-output]', `Active provider: ${provider.label} (${provider.mode})`);
    }
    button.addEventListener('click', () => {
      list.querySelectorAll('.provider-router__option').forEach((entry) => entry.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      writeCockpitOutput(root, '[data-provider-router-output]', `Active provider: ${provider.label} (${provider.mode})`);
    });
    list.append(button);
  });
}

/* =============================================================================
   05) END OF FILE
============================================================================= */
