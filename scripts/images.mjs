/**
 * Responsive image generator (same pattern as masajesorisha.com/scripts/images.ts).
 *
 * Reads the master WebP images under public/images/, emits AVIF + WebP variants
 * at the viewport-aligned width ladder, and writes a manifest that the Image
 * component uses to build <picture> srcsets.
 *
 * Run: `npm run images` (add `-- --force` to regenerate existing variants).
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'images', 'manifest.json');

/** Viewport-aligned widths. Each master is capped at its intrinsic width (no upscaling). */
const WIDTHS = [320, 640, 960, 1024];

const AVIF = { quality: 52, effort: 4 };
const WEBP = { quality: 76 };

const FORCE = process.argv.includes('--force');

/**
 * Generated variants end with one of the ladder widths (or the intrinsic width), e.g. `name-640.avif`.
 * Masters are plain `.webp` files without a trailing `-<digits>`.
 */
const GENERATED = /-\d+\.(avif|webp)$/;
const isMaster = (file) => file.endsWith('.webp') && !GENERATED.test(file) && !file.startsWith('og-');

let created = 0;
let skipped = 0;
let bytes = 0;

async function emit(input, out, width, fmt) {
  if (!FORCE && existsSync(out)) {
    skipped++;
    return;
  }
  const pipeline = sharp(input).resize({ width, withoutEnlargement: true });
  await (fmt === 'avif' ? pipeline.avif(AVIF) : pipeline.webp(WEBP)).toFile(out);
  created++;
  bytes += (await stat(out)).size;
}

async function run() {
  const files = (await readdir(IMAGES_DIR)).filter(isMaster).sort();
  const manifest = {};

  for (const file of files) {
    const base = file.replace(/\.webp$/, '');
    const input = path.join(IMAGES_DIR, file);
    const meta = await sharp(input).metadata();
    const intrinsic = meta.width ?? Math.max(...WIDTHS);
    const height = meta.height ?? intrinsic;

    const widths = WIDTHS.filter((w) => w <= intrinsic);
    if (widths.length === 0 || widths.at(-1) < Math.min(intrinsic, Math.max(...WIDTHS))) widths.push(intrinsic);

    const entry = { width: intrinsic, height, avif: [], webp: [] };

    for (const w of widths) {
      const avifName = `${base}-${w}.avif`;
      const webpName = `${base}-${w}.webp`;
      await emit(input, path.join(IMAGES_DIR, avifName), w, 'avif');
      await emit(input, path.join(IMAGES_DIR, webpName), w, 'webp');
      entry.avif.push({ w, src: `/images/${avifName}` });
      entry.webp.push({ w, src: `/images/${webpName}` });
    }

    manifest[`/images/${file}`] = entry;
  }

  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log(
    `✅ ${files.length} masters · ${created} new variants · ${skipped} skipped · ` +
      `${(bytes / 1024).toFixed(0)} KB generated\n   manifest → ${path.relative(ROOT, MANIFEST_PATH)}`
  );
}

run().catch((err) => {
  console.error('❌ Image generation failed:', err);
  process.exit(1);
});
