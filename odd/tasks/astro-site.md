# Feature: GERP DJ site in Astro + Svelte

Objective: implement the approved prototype (`design/index.html`, `design/DESIGN.md`) as a production Astro 7 site with Svelte 5 islands, statically deployed to Cloudflare Workers.
Branch: `feat/astro-site` (baseline `fa9d00a` on `main`). Delivery: `ask-on-risk`, work-unit commits per task. Test runner: Vitest (unit) + `astro check` + `astro build` + browser checks against `dist/`.

## Specs

- **S1 Stack.** User: "este proyecto va a ser un sitio web profesional para DJ creado en Astro, SvelteKit, Tailwind CSS, Glassmorphism". Accepted reading (L3): Astro + Svelte islands via `@astrojs/svelte`, NOT SvelteKit; Tailwind v4 via `npx astro add tailwind`; glass utilities `glass`, `glass-strong`, `glass-subtle` with a solid fallback.
- **S2 Deploy.** User: "el sitio web va a ser desplegado en Cloudflare Workers". Fully static output (no adapter, there is no backend), `wrangler.jsonc` with `assets.directory: "./dist"` and a real 404 page. No deploy unless the user asks.
- **S3 Languages.** User: "Idioma del sitio en Español y Gallego, por favor". Spanish at `/`, Galician at `/gl/`, Astro `i18n` routing, shared Spanish slugs, `ES | GL` switcher keeps the current page, `hreflang` alternates (es, gl, x-default). A missing Galician string must fail `astro check`.
- **S4 Contact = WhatsApp only.** User: "El mecanismo de comunicación y reserva va a ser mediante WhatsApp Business solamente. No mediante correo electrónico"; "El número de WhatsApp es: +34 613 34 05 00"; "Los enlaces de contacto/reserva que se habran en una página nueva porfa". `wa.me/34613340500` with prefilled text in the visitor's language; every WhatsApp link `target="_blank" rel="noopener"`; no email, `mailto:`, form endpoints or newsletter. Messages exactly as the prototype builds them (see `design/index.html` `WA_MSG`, booking and availability handlers; dates as `dd/mm/yyyy`).
- **S5 Market.** User: "enfoca el contenido en Ourense, Galicia, España, que es donde se brindan los servicios preferentemente". Titles/descriptions lead with "DJ en Ourense"; official Galician toponyms.
- **S6 Hidden, not deleted.** User: "Oculta, no borres, por el momento las páginas de: Sesiones, Tienda"; "Oculta porfa los perfiles de redes sociales"; "Actualmente no hay ninguna gira planificada (imágenes 1 y 2), así que puedes ocultar estas secciones o hacerla más genéricas"; "Mantén oculta la sección Música por ahora". `site.features = { tour: false, music: false, sets: false, shop: false, socials: false }`; a disabled page is neither built nor linked; enabling a flag restores it without code changes.
- **S7 Legal.** User: "Crea también las páginas de: Privacidad · Cookies". `/privacidad`, `/cookies` (+ `/gl/…`) with the prototype's es/gl text (bracketed placeholders kept).
- **S8 Press kit.** User: "Porfa, diseña también el Descargar dossier de prensa (PDF)". Serve `design/press/dossier-gerp-dj-{es,gl}.pdf` from `public/press/`; the buttons link to the current language's file in a new tab.
- **S9 Brand + media.** User: "Porfa, haz el rebanding a "GERP DJ""; "Las imágenes también hace falta que las proceses (incluyendo cambiarles el nombre insertando keywords SEO) y que las conviertas en AVIF y WEBP". Use the masters in `public/images/` through `src/lib/images/manifest.json` as `<picture>` (AVIF then WebP, width/height, sizes); videos from `public/videos/`.
- **S10 Hero still.** User: "En lo que carga el video del header, que se cargue una imagen previa para no brindar una mala experiencia de usuario porfa". Still `<picture>` with `fetchpriority="high"` paints first; video fades in on `playing`; pause button (WCAG 2.2.2); no autoplay under `prefers-reduced-motion`.
- **S11 Parity.** User (L1): "Ahora implementa el sitio en Astro con Svelte". Pages, sections, copy (es/gl), tokens and behaviour match the prototype; fonts self-hosted (privacy policy promises no third parties besides WhatsApp and Cloudflare).

## Tasks

| ID | Specs | Route | Status | Commit / evidence |
| --- | --- | --- | --- | --- |
| T1 Foundation: scaffold, config, i18n, layout, header/menu/footer, Picture, WhatsApp lib + tests, fonts, tokens | S1–S5, S9, S11 | delegated (context backstop: parent session is long) | done, verifier running | `dbad37d`; vitest RED (module missing) → GREEN 11/11; astro check 0 errors; build 2 pages |
| T2 Home page (hero video + still + availability, services, en acción, equipo, about, band, channel) | S4, S5, S9, S10, S11 | delegated (context backstop) | pending | |
| T3 Inner pages: contratación (booking island), bio, privacidad, cookies, 404, press PDFs | S3, S4, S7, S8, S11 | delegated (context backstop) | pending | |
| T4 Hidden features behind flags: tour (collection, list, countdown), music, sets, shop, socials | S6 | delegated (context backstop) | pending | |
| T5 Verification: build, check, unit tests, browser parity checks, docs | all | inline | pending | |

## Log

- **L1 (2026-11-14, user, verbatim):** "Ahora implementa el sitio en Astro con Svelte"
- **L2 (2026-11-14, user, verbatim):** "Mantén oculta la sección Música por ahora"
- **L3 (2026-11-14, decision):** SvelteKit cannot run inside Astro; the stack is Astro + `@astrojs/svelte` islands (recorded in CLAUDE.md since the first session).
- **L4 (2026-11-14, setup):** git initialised; baseline `fa9d00a` on `main`; work on `feat/astro-site`. Raw client media in `.agents/context/` is git-ignored (30 MB, inputs of `npm run media`). RDD review mode is off globally. No `.atl/skill-registry.md`; Svelte skills passed by path.
- **L5 (2026-11-14, T1):** writer delivered foundation (Astro 7.4.12, Svelte 5, Tailwind 4.3, Fonts API local provider with Fontsource Archivo wdth+wght, typed es/gl dictionaries, WhatsApp lib with tests). Parent re-ran vitest/check/build: pass. Risk: item 5 (new dependencies, deploy config) → independent verifier launched. RDD off, so no native review. Deviations accepted: extra i18n keys (`ui.*`, `wa.*`, `meta.description`, aria labels — Galician aria labels need native review); 8 unused prototype GL keys dropped; shop link gets `target="_blank"`.
- **Next:** verifier verdict for T1, then delegate T2 + T3.
