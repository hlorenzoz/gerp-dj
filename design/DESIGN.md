# GERP DJ — site design

**Brand: GERP DJ** — mobile DJ with his own booth, sound system, LED lighting and microphone (shown in the client's photos and videos). **Market focus: Ourense (Galicia, Spain) first, then the rest of Galicia, then the rest of Spain.** The artist is a local service DJ (weddings, corporate events, private parties, clubs and *festas*) who also plays club/festival dates. Every page leads with Ourense in copy, sample data and SEO.

Static prototype: `design/index.html` (open it in a browser; pages switch by hash, e.g. `#/tour`).
It is the visual contract for the Astro + Svelte build. Content in it is **sample data** to be replaced.

## What the reference sites taught us

Studied: R3HAB, Baby Van Beezly, Jauz, Oliver Heldens, Akira The Don, DJ Snake, W&W, Don Diablo, GORDO, B Jones, Carl Cox, Alan Walker, Timmy Trumpet.

| Pattern | Seen on | Decision |
| --- | --- | --- |
| Short nav (3–6 items), merch links out to an external store | R3HAB, DJ Snake, Oliver Heldens, Timmy Trumpet | 5 links + "Book" action + external "Shop" |
| Full-bleed hero image/video, name huge | most | Hero photo + huge wordmark |
| Service-led sections (weddings, corporate, private) with a CTA per service | Baby Van Beezly | Home "DJ en Ourense" section: 4 services, each with a prefilled WhatsApp quote button |
| Countdown to next show in the hero | Don Diablo | Glass "Next show" card with live countdown (the page's one live element) |
| Tour list: date, event, city/country, sub-brand tag, Tickets / RSVP, region filter | Don Diablo, Alan Walker | Own data (content collection), zone filter **Ourense / Resto de Galicia / Resto de España**, Tickets / Sold out / Free entry states |
| Tour via Bandsintown/Songkick widgets | R3HAB, DJ Snake, B Jones, Alan Walker | **Rejected**: widgets render unstyled/empty without JS and break the design. Optional sync later |
| Releases as cover grid with smart links | Jauz, DJ Snake, W&W, Don Diablo | Cover rail + per-release streaming links |
| Live sets / videos block | GORDO, Jauz, DJ Snake | Featured set + list, YouTube facade (no iframe until click) |
| Booking form with event date, city/venue, event type | GORDO | Same fields on `/contratacion`, but the form **builds a WhatsApp message** instead of posting |
| Contacts split by role and region (emails) | Carl Cox, R3HAB, Oliver Heldens, W&W | **Replaced**: one WhatsApp Business number, plus a prefilled press chat |
| Newsletter "get music first" | Timmy Trumpet, Jauz, Akira | **Replaced**: WhatsApp Channel (home + tour "Avísame") |
| Name at full width in the footer | — (house style) | Footer closes with the wordmark |

## Contact model: WhatsApp Business only

No email anywhere, no form backend, no newsletter provider. The site is therefore fully static on Cloudflare Workers.

- **Booking**: the form collects name, event date, city/venue, event type and message, then opens `https://wa.me/<number>?text=<encoded message>` in the visitor's language. The visitor only presses send. Without JS the form still opens the chat (empty message).
- **Press**: link to the same number with a prefilled press message.
- **Announcements**: `https://whatsapp.com/channel/<id>` ("Seguir el canal") replaces the newsletter and the tour "get notified" form.
- Pitfall seen live on Jauz and Timmy Trumpet: a newsletter block showing "This newsletter signup form needs a storage option" to visitors. Not possible here: there is no form storage.

## Press kit (dossier de prensa)

Source: `src/pages/dossier/[locale].astro` (noindex, unlinked) — A4 landscape, 6 pages: cover · bio + facts · services + own equipment · "En acción" photos + press placeholder · what's included / what we need · booking (WhatsApp, QR to `wa.me`). All data from `src/config/site.ts` + dictionaries; images are the JPEG copies in `design/press/img/`.
Output: `public/press/dossier-gerp-dj-{es,gl}.pdf`. The site's "Descargar dossier de prensa (PDF)" buttons link to the file of the current language and open in a new tab.
Regenerate with `just press` (builds, serves `dist/`, prints both PDFs with headless Chrome) after any change to `site.ts`, the dictionaries or the photos.
Sample content to confirm: "what we need on site" items, press quotes, the GERP DJ story, channel URL, domain.

## Client media

Raw files: `.agents/context/` (4 photos, 5 WhatsApp videos; videos 4 and 5 are the same clip). `npm run media` (`scripts/media-masters.sh`) produces:

| Master (`public/images/`) | Source | Used in |
| --- | --- | --- |
| `gerp-dj-fiesta-aldea-ourense` + `public/videos/…mp4` | village fiesta video | Hero loop + still, En acción, gallery, dossier |
| `gerp-dj-sesion-terraza-ourense` + `public/videos/…mp4` | terrace session video | En acción loop, booking band, gallery, dossier |
| `gerp-dj-luces-fiesta-ourense` | terrace video still | Ambient background, gallery, dossier |
| `gerp-dj-ourense-controladora-denon-dj` | photo (hands on controller) | Services, gallery, dossier |
| `gerp-dj-ourense-cabina-iluminacion-led` | photo (booth + LED lights) | Equipo propio, gallery, dossier cover |
| `gerp-dj-ourense-retrato-equipo-sonido` | portrait (family photos blurred, "HONOR 400" watermark cropped) | About, gallery, dossier bio |

`npm run images` then writes AVIF + WebP variants (320/640/960/1024, capped at the master width) and `src/lib/images/manifest.json`. Context frames for each video: `.agents/context/frames/video-N/contact-sheet.jpg`.

## Hidden for now (code kept)

`site.features` flags, all `false` until the client asks: `tour` (`/gira`, home dates, next-show countdown — no tour is planned), `music` (`/musica`, latest release, releases rail — the releases were sample data and must not be published under a real brand), `sets` (`/sesiones` page, home "En directo" block), `shop` (external store link), `socials` (footer profiles). A disabled page is neither built nor linked.

## Languages

Spanish (default, `/`) and Galician (`/gl/`), Astro `i18n` routing with `prefixDefaultLocale: false`. Same slugs in both locales (Spanish slugs) to keep routing simple; header shows an `ES | GL` switcher that keeps the current page. Every page emits `<link rel="alternate" hreflang>` for `es`, `gl` and `x-default`.

## Sitemap

| Route (es · gl) | Purpose | Sections |
| --- | --- | --- |
| `/` · `/gl/` | Who GERP DJ is + what to do next | Hero (village-fiesta video + availability check → WhatsApp) · Services (DJ en Ourense, quote per service) · En acción (terrace video + village photo) · Equipo propio · About teaser · Booking band · WhatsApp Channel · Footer. Nav anchors: `#servicios`, `#en-accion`, `#equipo` |
| `/gira` · `/gl/gira` | Every date, buy tickets | Title · region filter · upcoming list · past shows · "Avísame" → WhatsApp Channel |
| `/musica` · `/gl/musica` | Discography | Title · type filter (Singles / Remixes / EPs y álbumes) · cover grid with links |
| `/bodas`, `/eventos-empresa`, `/fiestas-privadas` (+ `/gl/…`) | Planned for the Astro build: one landing page per service for local search ("DJ para bodas en Ourense") | Service pitch · what's included · WhatsApp quote button |
| `/sesiones` · `/gl/sesiones` | Watch / listen | Featured set · set list · radio show |
| `/bio` · `/gl/bio` | Bio & press | Bio · facts · gallery · press quotes (placeholder) · press kit download |
| `/contratacion` · `/gl/contratacion` | Convert promoters | Booking form → WhatsApp · WhatsApp number and hours · press chat · press kit |
| `/privacidad` · `/gl/privacidad` | Privacy policy (RGPD/LOPDGDD) | Controller, data via WhatsApp, legal basis, retention, providers, rights. Placeholders in brackets |
| `/cookies` · `/gl/cookies` | Cookie policy (LSSI-CE) | No own cookies, Cloudflare technical cookies, click-to-load embeds |
| `/404` | Not found | Prerendered |
| Shop | External store link | — |

## Tokens (Tailwind v4 `@theme`)

| Token | Value | Role |
| --- | --- | --- |
| `--color-ground` | `#07070a` | Page background |
| `--color-surface` | `#121217` | Solid fallback for glass |
| `--color-ink` | `#f3f2ee` | Text |
| `--color-muted` | `#a9a8a3` | Secondary text only |
| `--color-acid` | `#dcff3c` | Accent: primary action, live countdown, active filter |
| `--color-signal` | `#ff5a36` | Sold out / alerts only |
| `--font-display` | Archivo (width 125, weight 800–900) | Wordmark, headings |
| `--font-sans` | Archivo (width 100, weight 400–600) | Text |

One family (Archivo variable, width axis 62–125). Buttons fully round. Panels `rounded-3xl`.

### Glass tiers (Tailwind `@utility`)

| Utility | Background | Blur | Border | Use |
| --- | --- | --- | --- | --- |
| `glass-subtle` | `ink / 5%` | 8px | `ink / 8%` | Chips, filter tabs, streaming buttons |
| `glass` | `ground / 35%` | 18px + saturate 140% | `ink / 12%` | Header, tour list, cards over photos |
| `glass-strong` | `ground / 60%` | 28px | `ink / 16%` | Mobile menu, forms, next-show card |

Rule: glass always sits over a photo or colour field. Fallback without `backdrop-filter`: `--color-surface` at 92%.

## Component map (Astro vs Svelte)

| Component | Type | Hydration | Data |
| --- | --- | --- | --- |
| `BaseLayout`, `Header`, `Footer`, `Section` | `.astro` | — | — |
| `MobileMenu` | `.svelte` | `client:load` | nav links |
| `Hero` | `.astro` | — | site config |
| `NextShowCountdown` | `.svelte` | `client:idle` | next `tour` entry |
| `TourList` (filter by region, past toggle) | `.svelte` | `client:visible` | `tour` collection |
| `ReleaseCard`, `ReleaseRail` | `.astro` | — | `releases` collection |
| `ReleaseFilter` | `.svelte` | `client:visible` | `releases` collection |
| `VideoFacade` (YouTube on click) | `.svelte` | `client:visible` | `sets` collection |
| `BookingForm` | `.svelte` | `client:visible` | builds the `wa.me` message in the current locale |
| `WhatsAppChannel` | `.astro` | — | `site.whatsapp.channelUrl` |
| `ContactBlock` | `.astro` | — | `site.whatsapp.number`, hours |

### Collections (`src/content.config.ts`)

- `tour`: `date`, `city`, `province`, `zone` (`ourense` \| `galicia` \| `espana`), `venue`, `event` (es/gl), `ticketUrl?`, `status` (`onsale` \| `soldout` \| `free`)
- `services`: `slug`, `title` (es/gl), `summary` (es/gl), `whatsappMessage` (es/gl)
- `releases`: `title`, `type` (`single` \| `remix` \| `ep` \| `album`), `date`, `label`, `cover`, `links` (spotify, apple, beatport, soundcloud, youtube)
- `sets`: `title`, `venue`, `date`, `duration`, `youtubeId`

## Local SEO

- Titles and descriptions lead with "DJ en Ourense" (es) and the Galician equivalent; official Galician toponyms in both languages (Ourense, O Barco de Valdeorras, Xinzo de Limia).
- JSON-LD for the artist as a local service provider with `areaServed` Ourense / Galicia (exact schema.org types to be confirmed during the build).
- Footer carries "DJ en Ourense, Galicia".

## Motion

Entrance per section (heading → text → media, 70ms stagger, 24px rise), slow drift on the hero photo, hover/press on every control, countdown ticking. All dropped under `prefers-reduced-motion`.

## Open items for the client

- Higher-resolution originals of the videos (current WhatsApp copies are 848×480), the GERP DJ story, logo file.
- WhatsApp Business: +34 613 34 05 00 (confirmed). Pending: business hours and WhatsApp Channel URL.
- Galician copy review by a native speaker.
