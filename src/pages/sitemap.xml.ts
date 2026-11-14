import { buildSitemap } from '../lib/seo';

// Static endpoint: built once into dist/sitemap.xml from src/config/site.ts.
export const GET = () =>
  new Response(buildSitemap(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
