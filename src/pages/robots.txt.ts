import { buildRobots } from '../lib/seo';

// Static endpoint: built once into dist/robots.txt from src/config/site.ts.
export const GET = () => new Response(buildRobots(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
