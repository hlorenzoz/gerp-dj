# GERP DJ — project commands (requires: just, Node >= 22.23.4, npm, pre-commit; media/og: ImageMagick; press/og: Google Chrome, python3)
set shell := ["bash", "-euo", "pipefail", "-c"]

# List the available recipes
default:
    @just --list

# Install dependencies from the lockfile and the git hooks (pre-commit + pre-push)
setup:
    npm ci
    pre-commit install

# Development server
dev:
    npm run dev

# Rebuild media from .agents/context: SEO-named masters, video loops, frames, press JPEGs, AVIF/WebP variants
media:
    npm run media
    npm run images
    just cdn-images

# Mirror every processed image (masters + AVIF/WebP variants) into .agents/cdn/gerp-dj/images/ for the CDN upload
cdn-images:
    mkdir -p .agents/cdn/gerp-dj/images
    rsync -a --delete public/images/ .agents/cdn/gerp-dj/images/
    @echo "cdn    $(ls .agents/cdn/gerp-dj/images | wc -l | tr -d ' ') images in .agents/cdn/gerp-dj/images"

# AVIF/WebP variants + manifest only (pass --force to regenerate)
images *args:
    npm run images -- {{ args }}

# Unit tests (Vitest)
test:
    npm test

# Types, templates and Galician dictionary completeness (astro check)
check:
    npm run check

# Formatting, lint and file hygiene (the hooks pre-commit.ci runs)
lint:
    pre-commit run --all-files

# Production build into dist/
build:
    npm run build

# Every quality gate: lint, unit tests, types, build
quality: lint test check build

# Serve dist/ with the Workers runtime, as in production
preview: build
    npx wrangler dev

# Validate the Cloudflare deploy without publishing
deploy-dry: quality
    npx wrangler deploy --dry-run

# Deploy to Cloudflare Workers after every quality gate passes
[confirm("Deploy GERP DJ to Cloudflare Workers?")]
deploy: quality
    npx wrangler deploy

# Headless Chrome used by `press` and `og` (override with CHROME=/path/to/chrome)
chrome := env("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

# Press kit PDFs from the site data: builds, serves dist/ and prints /dossier/{es,gl}/ to public/press/
press: build
    #!/usr/bin/env bash
    set -euo pipefail
    # Plain static server: `astro preview` detaches from the shell when it detects an agent.
    python3 -m http.server 4329 --bind 127.0.0.1 --directory dist >/dev/null 2>&1 & server=$!
    trap 'kill $server' EXIT
    until curl -sf http://127.0.0.1:4329/dossier/es/ >/dev/null; do sleep 0.3; done
    for l in es gl; do
      "{{ chrome }}" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
        --print-to-pdf="public/press/dossier-gerp-dj-$l.pdf" "http://127.0.0.1:4329/dossier/$l/" 2>/dev/null
      cp "public/press/dossier-gerp-dj-$l.pdf" dist/press/
    done
    ls -l public/press

# OpenGraph image (1200×630 JPEG): builds, serves dist/ and screenshots /og/card/ into public/og/gerp-dj.jpg
og: build
    #!/usr/bin/env bash
    set -euo pipefail
    # Plain static server: `astro preview` detaches from the shell when it detects an agent.
    python3 -m http.server 4329 --bind 127.0.0.1 --directory dist >/dev/null 2>&1 & server=$!
    tmp=$(mktemp -d)
    trap 'kill $server; rm -rf "$tmp"' EXIT
    until curl -sf http://127.0.0.1:4329/og/card/ >/dev/null; do sleep 0.3; done
    "{{ chrome }}" --headless --disable-gpu --hide-scrollbars --window-size=1200,630 --virtual-time-budget=10000 \
      --screenshot="$tmp/og.png" http://127.0.0.1:4329/og/card/ 2>/dev/null
    mkdir -p public/og dist/og
    magick "$tmp/og.png" -strip -quality 82 -sampling-factor 4:2:0 -interlace JPEG public/og/gerp-dj.jpg
    cp public/og/gerp-dj.jpg dist/og/
    magick identify public/og/gerp-dj.jpg
