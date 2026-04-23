import { mountClonedDestinationSection } from '../platform-destination-source.js';

const THEME_SELECTORS = [
  '#home-settings-panel [data-home-settings-section="theme"]',
];

export function mountHomePlatformDestination(root) {
  mountClonedDestinationSection(root, {
    selectors: THEME_SELECTORS,
    fallbackTitle: 'Theme',
    fallbackCopy: 'Theme controls are not available yet.',
  });
}
