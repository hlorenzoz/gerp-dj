# GERP DJ — project commands (requires: just, Node >= 22.23.4, npm, pre-commit)
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
