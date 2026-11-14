# GERP DJ — official website

Astro 7 + Svelte 5 islands + Tailwind CSS v4, deployed to Cloudflare Workers.
Brand: **GERP DJ**, a mobile DJ from Ourense with his own sound, lighting and booth (fiestas, weddings, private and corporate events). Not a club producer.
Visual reference: `design/index.html` (static prototype) and `design/DESIGN.md` (sitemap, tokens, components, media).

## Commands

Use the Justfile (`just --list`); it wraps the npm scripts.

- `just setup` — `npm ci` + git hooks (pre-commit and pre-push)
- `just dev` — Astro 7 detaches when it detects an agent; health check at `/_astro/status`
- `just quality` — lint (pre-commit hooks), `vitest`, `astro check`, build: must pass before any change is done
- `just test` / `just check` / `just build` — single gates; one test file: `npx vitest run src/lib/shows.test.ts`
- `just preview` — serve `dist/` with the Workers runtime; `just deploy-dry` validates the deploy without publishing
- `just deploy` — quality gates + `wrangler deploy` (only when the user asks)
- `just media` — raw client media in `.agents/context/` → SEO-named WebP masters in `public/images/`, muted MP4 loops in `public/videos/`, context frames and press-kit JPEGs; then AVIF + WebP variants and `src/lib/images/manifest.json`

## Single source of truth (ALWAYS)

- `src/config/site.ts` is the ONLY place business data is written: brand, URL (`https://gerp-dj.hlorenzoz.com`, `SITE_URL` overrides it for previews), WhatsApp number/display, channel URL, hours, response time, location and area served, services, kit, languages, legal facts (retention, last update), media, press PDFs, the page registry (`site.pages`), noindex paths and feature flags.
- Never hardcode any of those values in components, dictionaries, messages, JSON-LD, OpenGraph, `llms.txt`, `robots.txt`, `sitemap.xml` or the press kit. Dictionaries use placeholders (`{brand}`, `{city}`, `{region}`, `{phone}`, `{responseHours}`, `{days}`, `{hoursFrom}`, `{hoursTo}`, `{retentionMonths}`, `{updated}`, `{year}`, `{country}`, `{web}`, `{channel}`) that `useT(locale)` fills from `site`; a new fact means a new field in `site.ts` + a placeholder, never a literal.
- New pages go in the `site.pages` registry so nav, sitemap and `llms.txt` pick them up. Change a fact once in `site.ts`, then rebuild and run `just press` (and `just og` if the brand/visual changes).
- `design/index.html` is a frozen design reference, not a data source.

## Stack decisions

- **NOT SvelteKit.** Svelte runs inside Astro via `@astrojs/svelte` (islands). Never add SvelteKit, `+page.svelte` or `@sveltejs/adapter-*`.
- Add official integrations with `npx astro add <name>` (svelte, tailwind, cloudflare, sitemap). Never hand-edit `package.json` for those.
- Tailwind v4 through the Vite plugin: `@import "tailwindcss"` in `src/styles/global.css`, tokens in `@theme`. No `tailwind.config.*`, no `@astrojs/tailwind`.
- Cloudflare Workers as a **fully static** site: no `@astrojs/cloudflare` adapter, `wrangler.jsonc` with `assets.directory: "./dist"`. There is no backend; add the adapter only if the user asks for on-demand rendering.
- **Contact and booking ONLY via WhatsApp Business**: `wa.me` click-to-chat links with prefilled text, plus the WhatsApp Channel for announcements. Never add email, `mailto:`, form endpoints, Astro Actions for contact, or newsletter providers. Number and channel URL live in one place (`src/config/site.ts`).
- Images: never reference a master or a raw file; render `<picture>` (AVIF then WebP) from `src/lib/images/manifest.json`. File names are `gerp-dj-<keywords>-ourense…` in Spanish; new media goes through `npm run media` + `npm run images`.
- Content (tour dates, releases, sets) lives in content collections (`src/content.config.ts`), not hardcoded in components.

## Conventions

- `.astro` by default. A `.svelte` component only when it needs client state (mobile menu, countdown, tour filter, video facade, booking form that builds the WhatsApp message).
- Hydration: `client:visible` by default, `client:load` only for the mobile menu. Island props must be serializable (no functions).
- Svelte 5 runes only (`$props`, `$state`, `$derived`). No `export let`, no stores for local state. Run the svelte MCP autofixer on every `.svelte` file.
- Glass surfaces only through the `glass`, `glass-strong`, `glass-subtle` utilities in `global.css`. Never inline `backdrop-blur-*` + `bg-*/NN` combos.
- Market focus: **Ourense (Galicia, Spain) first**, then the rest of Galicia, then Spain. Copy, sample data, service pages and SEO (titles, descriptions, `areaServed`) lead with Ourense. Use official Galician toponyms (Ourense, A Coruña, O Barco de Valdeorras) in both languages.
- Site languages: Spanish (default, unprefixed `/`) and Galician (`/gl/`) via Astro `i18n` routing. Every UI string comes from `src/i18n/{es,gl}.ts`; never hardcode copy in components. Each page emits `hreflang` alternates; a missing Galician string is a bug, not a fallback to Spanish.
- Code, identifiers, comments and commits in English; only user-facing copy is es/gl.
- Never invent press quotes, stats, partner logos or biography facts about GERP DJ — only what the client's media shows; leave a visible `[Pendiente: …]` placeholder otherwise.
- Tour (`/gira`, home dates, next-show countdown), music (`/musica`, releases), sessions (`/sesiones`), shop link and social profiles are **hidden, not deleted**: `site.features.{tour,music,sets,shop,socials} = false`. While `tour` is off, the hero shows the availability check instead of the countdown. Never remove their code; a disabled page must not be built or linked.
- Verify Astro APIs with the `astro-docs` MCP and Svelte APIs with the `svelte` MCP before writing; training data is outdated for Astro 7.

## Gotchas

- Glass needs a picture or colour behind it; on flat black it is invisible. Always keep a solid fallback under `@supports not (backdrop-filter: blur(1px))`.
- No `backdrop-filter` on large animated or scrolling areas (mobile GPU cost).
- Light/dark theme: tokens switch with `light-dark()`; `ThemeToggle.astro` + an `is:inline` head script set `data-theme` before paint (system default, choice in `localStorage.theme`). Acid as TEXT/icon/ring → `text-acid-ink` (acid fails contrast on light); text ON acid fills → `text-on-acid`; anything over photos/video → `theme-dark` so it stays dark in both themes. Check Lighthouse accessibility in both themes (`--blink-settings=preferredColorScheme=1` forces light).
- Never put `reveal` (or any opacity-0 entrance) on above-the-fold hero content: the wordmark is the LCP element and the fade delayed it by ~2.4 s (Lighthouse 79 → 96 once removed). The hero video has no `poster`; the still `<Picture>` underneath is the poster.
- `getCollection()` with the `file()` loader returns entries sorted by id, not file order: sort explicitly (by `date`).
- pre-commit.ci skips `astro-check`, `unit-tests`, `astro-build` (it cannot `npm ci`); they run locally on `git push`. In zsh pass file lists to `pre-commit run --files` as arrays (`"${F[@]}"`), or every hook silently skips.
- Privacy/cookie pages promise: no analytics, no tracking cookies, third parties limited to WhatsApp and Cloudflare. So self-host fonts (no Google Fonts CDN — the prototype uses it only for speed), load embeds only after a click, and add a consent banner (LSSI-CE art. 22.2) plus a policy update before adding any analytics.
- `wa.me` numbers are digits only in full international format (`34613340500`: no `+`, spaces or leading `0`); the prefilled text goes through `encodeURIComponent` and is written in the visitor's current language. Every WhatsApp link (chat, quote, channel, booking form) opens in a new tab: `target="_blank" rel="noopener"`.
- Press kit: `src/pages/dossier/[locale].astro` renders it from `site` + dictionaries (noindex, unlinked); `just press` prints `public/press/dossier-gerp-dj-{es,gl}.pdf` with headless Chrome. It embeds the JPEG copies in `design/press/img/` (WebP sources make Chrome's PDF ~10× bigger). Regenerate after any data or photo change. OG image: `just og` (renders `/og/card/` → `public/og/gerp-dj.jpg`).
- SEO is generated, never hand-written: OpenGraph/Twitter tags and the JSON-LD `@graph` (`WebSite`, `EntertainmentBusiness`, page node) come from `src/lib/seo.ts`; `llms.txt`, `robots.txt` and `sitemap.xml` are static endpoints in `src/pages/`.
- Hero video: a still `<picture>` (fetchpriority high) paints first and the video fades in on `playing`; videos have a pause button (WCAG 2.2.2) and stay still under `prefers-reduced-motion`.
- WhatsApp message dates are built as `dd/mm/yyyy` by hand: `Intl` may lack Galician data and silently fall back to English.
- Client photos: blur private people in the background (family photos) and crop camera watermarks (e.g. "HONOR 400") — see `scripts/media-masters.sh`.
