# Feature: single source of truth, OpenGraph and structured data

Objective: every business fact (brand, contact, hours, location, services, legal facts, media, URLs) comes from one module and is reused by pages, i18n copy, WhatsApp messages, legal texts, OpenGraph, JSON-LD and the press kit.
Branch: `feat/ssot-seo` from `main` `2ed9382`. Test runner: Vitest + `astro check` + build + browser checks on `dist/`.

## Specs

- **S1 Single source of truth.** User: "Implementa un single source of truth para todo el sitio (que la data sea misma en todos los sitios) y actualiza el @CLAUDE.md para que siempre haga uso de esa fuente de información". `src/config/site.ts` is the only place business data is written; dictionaries interpolate it (`{brand}`, `{city}`, …) instead of repeating literals; legal texts, WhatsApp messages, JSON-LD, OpenGraph and the press kit read it. CLAUDE.md states the rule.
- **S2 OpenGraph.** User: "Actualiza también el OpenGraph y los datos estructurados por favor. Asegúrate de que estén bien y listos para producción". Every page: `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image` (absolute, 1200×630, with width/height/alt/type), `og:locale` + `og:locale:alternate`, Twitter `summary_large_image`. Absolute URLs come from `SITE_URL`.
- **S3 Structured data.** Same request. JSON-LD (`@graph`) valid for schema.org and Google: `WebSite`, the business (`EntertainmentBusiness`, Ourense/Galicia, WhatsApp contact point, services, languages), `WebPage` per page; values only from S1.
- **S4 Press kit from the same data.** The dossier PDFs are generated from the S1 data (no second copy of bio, services or contact in `design/press/dossier.html`).

- **S5 llms.txt.** User: "También implementa /llms.txt file https://llmstxt.org/". `/llms.txt` in llmstxt.org format, generated at build time from S1 (only enabled features, absolute URLs from `SITE_URL`).
- **S7 robots.txt + sitemap.xml.** User: "Añade también robots.txt y sitemap.xml". Generated at build from one route registry in S1 (no new dependency); sitemap with es/gl alternates; robots allows search and AI crawlers and points to the sitemap.
- **S8 Domain.** User: "La URL de Cloudflare va a ser https://gerp-dj.hlorenzoz.com". SSoT default URL; `SITE_URL` only overrides it.
- **S9 Light/dark theme.** User: "Y añade también el tema claro/oscuro al sitio porfa (image)" — a sun/moon pill toggle. Queued as T3 after T1 (same files: tokens, header, menu). User: "Usa el verde ácido de la marca" — the active knob uses `--color-acid`.
- **S6 README.** User: "Actualiza el @README.md porfa cuando termine". Written by the parent once T1 is merged-ready.

## Tasks

| ID | Specs | Route | Status | Commit / evidence |
| --- | --- | --- | --- | --- |
| T1 SSoT refactor + dossier from SSoT + OG + JSON-LD + OG image | S1–S4 | delegated (context backstop) | done | `f6e7eb6`, `09a91c0`, `0eebb93`, `13dc882`; tests 25→41; visible text identical to `2ed9382`; verifier MERGE: ready (mutation probe: every fact changes everywhere) |
| T2 Parent checks, CLAUDE.md rule, verifier (Risk item 3: shared helpers and copy used by every page), merge | S1–S4 | inline + verifier | done | verifier MERGE: ready; theme merged (`d35c269` via merge commit); e2e 11/11; Lighthouse a11y 100 dark+light |

## Log

- **L1 (2026-11-14, user, verbatim):** "Actualiza también el OpenGraph y los datos estructurados por favor. Asegúrate de que estén bien y listos para producción"
- **L2 (2026-11-14, user, verbatim):** "Implementa un single source of truth para todo el sitio (que la data sea misma en todos los sitios) y actualiza el @CLAUDE.md para que siempre haga uso de esa fuente de información"
- **L3 (2026-11-14):** `feat/astro-site` merged into `main` (`2ed9382`) and pushed; the first Cloudflare build failed because it built the previous `main` (no `build` script). Domain still unknown → `SITE_URL` must be set as a Cloudflare build variable.

- **L4 (2026-11-14):** T1 done (S1–S5, S7, S8); README written by a parallel agent (`fbb4390`); independent verifier: MERGE ready, advisories applied (shipped HTML comments, `{year}`, `{country}` documented). Theme (S9) running in an isolated worktree.
- **L5 (2026-11-14):** S9 theme delegated to an isolated worktree in parallel (user: "Y usa múltiples agentes porfa"); merged with 7 one-hunk conflicts (data refs from SSoT, classes from theme). Post-merge: vitest 41/41, build 14 pages, e2e 11/11, theme probe PASS, Lighthouse a11y 100 in both themes.
- **L6 (2026-11-14, user, verbatim):** "Sí, el dominio principal del sitio es: https://gerp-dj.com/" — S8 now uses `https://gerp-dj.com`; `gerp-dj.hlorenzoz.com` should redirect (301) to it.
