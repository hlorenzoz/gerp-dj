import { buildLlmsTxt } from '../lib/seo';

// Static endpoint: built once into dist/llms.txt from src/config/site.ts.
export const GET = () => new Response(buildLlmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
