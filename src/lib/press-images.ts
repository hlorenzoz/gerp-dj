// JPEG copies written by scripts/media-masters.sh into design/press/img. The press kit and the OG card use them
// instead of the WebP variants: Chrome embeds a JPEG in a PDF as-is but decodes WebP, which makes the PDF ~10× bigger.
const files = import.meta.glob<string>('/design/press/img/*.jpg', { eager: true, query: '?url', import: 'default' });

export function pressImage(name: string) {
  const url = files[`/design/press/img/${name}.jpg`];
  if (!url) throw new Error(`pressImage: design/press/img/${name}.jpg is missing (run just media)`);
  return url;
}
