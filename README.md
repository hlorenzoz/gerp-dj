# GERP DJ — official website

Official site of **GERP DJ**, a mobile DJ based in Ourense (Galicia, Spain) who brings his own sound, lighting and
booth to village fiestas, weddings, private and corporate events. The site is published in Spanish (`/`) and Galician
(`/gl/`). Bookings happen only through WhatsApp Business: there is no email, form backend or newsletter.

Production: <https://gerp-dj.com>

Features: home with hero video, booking page, video gallery, bio, privacy and cookie pages, a print-only press kit, generated SEO
files, and a light/dark theme (follows the system, remembers the visitor's choice).

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 7, fully static output (**not SvelteKit**) |
| Interactivity | Svelte 5 islands via `@astrojs/svelte` (runes only) |
| Styling | Tailwind CSS v4 through the Vite plugin; glass utilities `glass`, `glass-strong`, `glass-subtle` in `src/styles/global.css` |
| Font | Archivo variable (wdth + wght), self-hosted from `@fontsource-variable/archivo` via Astro's font API |
| Hosting | Cloudflare Workers static assets (`wrangler.jsonc`, no adapter, no Worker script) |
| Tests | Vitest |
| Lint/format | Biome (run through pre-commit) |
| Git hooks / CI | pre-commit locally, pre-commit.ci on pull requests |
| Task runner | just (`Justfile` wraps the npm scripts) |

## Requirements

| Tool | Version / note |
|---|---|
| Node.js | `.node-version` pins 24; `engines` requires `>=22.23.4` |
| npm | ships with Node |
| just | runs every project command |
| pre-commit | installs the git hooks |
| ffmpeg, ImageMagick 7 (`magick`) | optional: `just media`, `just og` |
| Google Chrome | optional: `just press`, `just og` (override the path with `CHROME=/path/to/chrome`) |
| python3 | optional: static server used by `just press` and `just og` |

## Getting started

```bash
just setup   # npm ci + pre-commit and pre-push hooks
just dev     # Astro dev server
just --list  # every recipe
```

| Recipe | Purpose |
|---|---|
| `just setup` | Install dependencies from the lockfile and the git hooks (pre-commit + pre-push) |
| `just dev` | Development server |
| `just media` | Rebuild media from `.agents/context`: SEO-named masters, video loops, frames, press JPEGs, AVIF/WebP variants |
| `just images [--force]` | AVIF/WebP variants + manifest only (`--force` regenerates) |
| `just test` | Unit tests (Vitest) |
| `just check` | Types, templates and Galician dictionary completeness (`astro check`) |
| `just lint` | Formatting, lint and file hygiene (the hooks pre-commit.ci runs) |
| `just build` | Production build into `dist/` |
| `just quality` | Every quality gate: lint, unit tests, types, build |
| `just preview` | Serve `dist/` with the Workers runtime, as in production |
| `just deploy-dry` | Validate the Cloudflare deploy without publishing |
| `just deploy` | Deploy to Cloudflare Workers after every quality gate passes (asks for confirmation) |
| `just press` | Press kit PDFs from the site data: prints `/dossier/{es,gl}/` to `public/press/` |
| `just og` | OpenGraph image (1200×630 JPEG): screenshots `/og/card/` into `public/og/gerp-dj.jpg` |

A single test file: `npx vitest run src/lib/shows.test.ts`.

## Single source of truth

`src/config/site.ts` is the only place business data is written: brand, site URL, WhatsApp number and display
format, WhatsApp Channel URL, opening hours, response time, location and area served, services, kit, languages,
legal facts (retention, last update), media, press PDF paths, the page registry, noindex paths and feature flags.

- Never hardcode those values in components, dictionaries, JSON-LD, OpenGraph, `llms.txt`, `robots.txt`,
  `sitemap.xml` or the press kit.
- Dictionaries use placeholders (`{brand}`, `{city}`, `{region}`, `{phone}`, `{responseHours}`, `{days}`,
  `{hoursFrom}`, `{hoursTo}`, `{retentionMonths}`, `{updated}`, `{web}`, `{channel}`) that `useT(locale)` in
  `src/i18n/index.ts` fills from `site`. A new fact means a new field in `site.ts` plus a placeholder.

**Changing a fact** (phone, hours, response time, area served…):

1. Edit the field once in `src/config/site.ts`.
2. `just quality`.
3. `just press` to regenerate the press kit PDFs (they embed the data).
4. `just og` if the brand or visual identity changed.

**Pages**: every public page is listed once in `site.pages` (path, title and description keys, schema.org type).
Navigation, `sitemap.xml` and `llms.txt` read this registry, so a new page must be added there.

**Feature flags**: `site.features` holds `tour`, `music`, `sets`, `shop` and `socials`. Only `socials` is on (YouTube and
TikTok in the footer and JSON-LD `sameAs`); the rest are `false`: their code
is kept but a disabled page is neither built nor linked. While `tour` is off, the hero shows the availability check
instead of the next-show countdown. To enable one:

1. Replace the sample data first: `src/content/{tour,releases,sets}.yaml`, `site.shopUrl`
   (placeholders today). Never publish invented dates, releases or profiles.
2. Set the flag to `true` in `site.features`.
3. `just quality`, then check the page in both languages.

## Project structure

```text
src/
  config/site.ts        business data, page registry, feature flags
  i18n/                 es.ts, gl.ts dictionaries + useT, date helpers
  lib/                  seo.ts, whatsapp.ts, shows.ts (+ tests), images/manifest.json
  layouts/              BaseLayout.astro (meta, hreflang, JSON-LD)
  components/           Header, Footer, Picture, MobileMenu; home/, pages/, features/
  content/              tour, releases, sets (YAML collections, flagged off)
  pages/                es routes, gl/ routes, dossier/, og/, llms.txt, robots.txt, sitemap.xml
  styles/global.css     Tailwind v4 @theme tokens and glass utilities
scripts/                media-masters.sh, images.mjs
public/                 images/, videos/, press/, og/, favicon.svg
design/                 DESIGN.md, frozen prototype index.html, press/img JPEGs
odd/tasks/              feature logbooks
```

## Content and media

Raw client media lives in `.agents/context/` (git-ignored, about 30 MB, kept local). `just media` runs:

1. `scripts/media-masters.sh` (ffmpeg + ImageMagick): SEO-named WebP masters in `public/images/`
   (`gerp-dj-<keywords>-ourense…`), one poster master per video, SEO-named lossless video copies in
   `.agents/cdn/gerp-dj/videos/`, context frames, and JPEG copies in `design/press/img/` for the press kit and OG
   card. It also blurs private people in the background and crops camera watermarks.

Videos are not part of the build: they stream from the CDN (`https://cdn.gerp-dj.com/videos/<name>.mp4`, Cloudflare
R2). `site.cdn` and `site.videos` in `src/config/site.ts` list them; upload a new copy there before adding its entry.
2. `scripts/images.mjs` (sharp): AVIF + WebP variants at 320/640/960/1024 px (no upscaling) and
   `src/lib/images/manifest.json`.

Always render images through `src/components/Picture.astro` by master name; never reference a master or raw file
directly. Picture throws at build time if the name is missing from the manifest.

## Internationalisation

- Spanish is the default locale (unprefixed `/`); Galician lives under `/gl/` (Astro `i18n` routing).
- Every UI string comes from `src/i18n/es.ts` and `src/i18n/gl.ts`. The Galician dictionary is typed with
  `satisfies Record<keyof typeof es, string>`, so a missing or extra key fails `astro check`.
- Each page emits `hreflang` alternates for `es`, `gl` and `x-default`.
- Official Galician toponyms (Ourense, A Coruña, O Barco de Valdeorras) are used in both languages.

## SEO

All SEO output is generated from `site.ts` by `src/lib/seo.ts`; nothing is hand-written.

| Output | Source |
|---|---|
| OpenGraph and Twitter tags | `src/layouts/BaseLayout.astro` + `seo.ts` |
| JSON-LD `@graph`: `WebSite`, `EntertainmentBusiness`, page node (`WebPage` / `ContactPage` / `AboutPage`) | `seo.ts` |
| `/sitemap.xml` | `src/pages/sitemap.xml.ts` (from `site.pages`, enabled pages only) |
| `/robots.txt` | `src/pages/robots.txt.ts`: allows search and AI crawlers (Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot…), disallows `site.noindexPaths` |
| `/llms.txt` | `src/pages/llms.txt.ts` |
| OG image `public/og/gerp-dj.jpg` | `just og` (renders `/og/card/`) |

The press kit (`/dossier/{es,gl}/`) and the OG card (`/og/card/`) are built but noindex and unlinked.

## Quality pipeline

Hooks are defined in `.pre-commit-config.yaml` and installed by `just setup`.

| Stage | Hooks | Where |
|---|---|---|
| pre-commit (every commit) | file hygiene (whitespace, EOF, line endings, merge markers, YAML/JSON, large files, private keys) + Biome | locally and on pre-commit.ci for pull requests (autofix) |
| pre-push | `astro check`, Vitest, `astro build` | locally only; skipped on pre-commit.ci because it cannot `npm ci` |

`just quality` runs every gate (lint, tests, check, build) and must pass before a change is considered done.

## Deployment

Production deploys through **Cloudflare Workers Builds** connected to the GitHub repository `hlorenzoz/gerp-dj`,
branch `main`.

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Custom domain | `gerp-dj.com` (Worker → Domains tab); `gerp-dj.hlorenzoz.com` should 301 to it |
| `SITE_URL` | unset in production; set it only to override the site URL for previews |

Local alternatives: `just deploy-dry` (all gates + `wrangler deploy --dry-run`) and `just deploy` (all gates +
`wrangler deploy`, with confirmation).

## Contact model and privacy

- Contact and bookings only via WhatsApp Business: `wa.me` click-to-chat links with prefilled text in the visitor's
  language, plus a WhatsApp Channel. No email, `mailto:`, form endpoints or newsletter.
- No analytics and no tracking cookies; third parties are limited to WhatsApp and Cloudflare.
- Fonts and videos are self-hosted (no Google Fonts CDN, no third-party players). Any future third-party embed must load only after a click.
- Adding analytics later requires a consent banner (LSSI-CE art. 22.2) and an update of the privacy and cookie
  pages (`src/components/pages/Privacy.astro`, `src/components/pages/Cookies.astro`) before it ships.

## Pending before launch

Client inputs:

- The GERP DJ story for the bio (`about.story` placeholder).
- Real press quotes (`press.placeholder`).
- Higher-resolution videos (current copies are 848×480).
- Native review of the Galician copy.

Legal: the controller's name and NIF in the privacy policy once the client is registered as autónomo.

## Ownership

All rights reserved. Photos, videos and brand assets belong to GERP DJ and may not be reused without permission.
