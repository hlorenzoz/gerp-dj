// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

/** @param {string} subset */
const archivo = (subset) => `./node_modules/@fontsource-variable/archivo/files/archivo-${subset}-wdth-normal.woff2`;

export default defineConfig({
  // Domain not decided yet: canonical and hreflang links are emitted only when SITE_URL is set.
  site: process.env.SITE_URL || undefined,
  integrations: [svelte()],
  i18n: {
    locales: ['es', 'gl'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  // Self-hosted Archivo with both variable axes (wdth 62–125, wght 100–900); no third-party font CDN.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            weight: '100 900',
            stretch: '62% 125%',
            style: 'normal',
            src: [archivo('latin')],
            unicodeRange: ['U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304', 'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD'],
          },
          {
            weight: '100 900',
            stretch: '62% 125%',
            style: 'normal',
            src: [archivo('latin-ext')],
            unicodeRange: ['U+0100-02BA', 'U+02BD-02C5', 'U+02C7-02CC', 'U+02CE-02D7', 'U+02DD-02FF', 'U+0304', 'U+0308', 'U+0329', 'U+1D00-1DBF', 'U+1E00-1E9F', 'U+1EF2-1EFF', 'U+2020', 'U+20A0-20AB', 'U+20AD-20C0', 'U+2113', 'U+2C60-2C7F', 'U+A720-A7FF'],
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
