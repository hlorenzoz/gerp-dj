import { describe, expect, it } from 'vitest';
import { enabledPages, site } from '../config/site';
import manifest from './images/manifest.json';
import { buildGraph, buildLlmsTxt, buildRobots, buildSitemap, pageUrl } from './seo';

const base = 'https://example.org';
type Node = Record<string, unknown> & { '@type': string; '@id': string };
const nodes = (graph: ReturnType<typeof buildGraph>) => graph['@graph'] as Node[];
const byType = (graph: ReturnType<typeof buildGraph>, type: string) =>
  nodes(graph).find((n) => n['@type'] === type) as Node;

describe('pageUrl', () => {
  it('builds absolute, localized, trailing-slash URLs', () => {
    expect(pageUrl('/', 'es', base)).toBe('https://example.org/');
    expect(pageUrl('/bio', 'gl', base)).toBe('https://example.org/gl/bio/');
  });
});

describe('buildGraph', () => {
  const graph = buildGraph({ base, locale: 'gl', path: '/gl/contratacion/', title: 'T', description: 'D' });

  it('links WebSite, the business, the page and its breadcrumb by stable @ids', () => {
    expect(graph['@context']).toBe('https://schema.org');
    expect(nodes(graph).map((n) => [n['@type'], n['@id']])).toEqual([
      ['WebSite', 'https://example.org/#website'],
      ['EntertainmentBusiness', 'https://example.org/#business'],
      ['ContactPage', 'https://example.org/gl/contratacion/#webpage'],
      ['BreadcrumbList', 'https://example.org/gl/contratacion/#breadcrumb'],
      ['FAQPage', 'https://example.org/gl/contratacion/#faq'],
    ]);
    const page = byType(graph, 'ContactPage');
    expect(page).toMatchObject({
      url: 'https://example.org/gl/contratacion/',
      name: 'T',
      description: 'D',
      inLanguage: 'gl',
      isPartOf: { '@id': 'https://example.org/#website' },
      about: { '@id': 'https://example.org/#business' },
    });
    expect(byType(graph, 'WebSite')).toMatchObject({
      name: 'GERP DJ',
      url: 'https://example.org/',
      inLanguage: ['es', 'gl'],
    });
  });

  it('describes the business from site.ts only (real address and price range, no invented ratings)', () => {
    const business = byType(graph, 'EntertainmentBusiness');
    expect(business).toMatchObject({
      name: 'GERP DJ',
      url: 'https://example.org/',
      image: 'https://example.org/og/gerp-dj.jpg',
      telephone: '+34613340500',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Carretera Xinzo de Limia, Avande No 2',
        postalCode: '32643',
        addressLocality: 'Porqueira',
        addressRegion: 'Ourense',
        addressCountry: 'ES',
      },
      priceRange: '€300-500',
      areaServed: [
        { '@type': 'City', name: 'Ourense' },
        { '@type': 'AdministrativeArea', name: 'Galicia' },
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'reservations',
        telephone: '+34613340500',
        availableLanguage: ['es', 'gl'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '10:00',
          closes: '19:00',
        },
      },
    });
    const offers = (business.hasOfferCatalog as { itemListElement: { itemOffered: { name: string } }[] })
      .itemListElement;
    expect(offers.map((o) => o.itemOffered.name)).toEqual([
      'Festas populares',
      'Vodas',
      'Festas privadas',
      'Eventos de empresa',
    ]);
    const json = JSON.stringify(graph);
    expect(json).not.toMatch(/aggregateRating|review|\{\w+\}/);
  });

  it('links the official social profiles and the WhatsApp Channel from site.ts as sameAs', () => {
    expect(byType(graph, 'EntertainmentBusiness').sameAs).toEqual([
      'https://www.youtube.com/@youtGERPDJ',
      'https://www.tiktok.com/@gerpdj',
      'https://whatsapp.com/channel/0029VbDytKl0rGiQqtirGx0W',
    ]);
  });

  it('legal pages are plain WebPages that are not about the business', () => {
    const page = byType(
      buildGraph({ base, locale: 'es', path: '/privacidad/', title: 'P', description: 'D' }),
      'WebPage',
    );
    expect(page['@id']).toBe('https://example.org/privacidad/#webpage');
    expect(page.about).toBeUndefined();
  });
});

describe('buildSitemap', () => {
  const xml = buildSitemap({ base });
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it('lists every enabled page in both locales with alternates', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(locs).toHaveLength(enabledPages().length * 2);
    expect(locs).toContain('https://example.org/');
    expect(locs).toContain('https://example.org/gl/bio/');
    expect(locs).toContain('https://example.org/galeria/');
    expect(locs).toContain('https://example.org/gl/galeria/');
    expect(xml.match(/<xhtml:link /g)).toHaveLength(locs.length * 3);
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://example.org/bio/"/>');
    expect(xml.match(/<lastmod>2026-11-14<\/lastmod>/g)).toHaveLength(locs.length);
    expect(xml.split('<url>').length).toBe(xml.split('</url>').length);
  });

  it('leaves out disabled features, 404 and the noindex routes', () => {
    expect(xml).not.toMatch(/gira|musica|sesiones|404|dossier|\/og\//);
    expect(buildSitemap({ base, pages: enabledPages({ ...site.features, tour: true }) })).toContain(
      '<loc>https://example.org/gl/gira/</loc>',
    );
  });
});

describe('buildRobots', () => {
  const txt = buildRobots({ base });

  it('allows every crawler (AI search included) in one group and points to the sitemap', () => {
    for (const bot of [
      '*',
      'Googlebot',
      'Bingbot',
      'GPTBot',
      'ChatGPT-User',
      'OAI-SearchBot',
      'PerplexityBot',
      'ClaudeBot',
      'Claude-SearchBot',
      'Google-Extended',
    ])
      expect(txt).toContain(`User-agent: ${bot}\n`);
    expect(txt).toContain('Allow: /\nDisallow: /dossier/\nDisallow: /og/card/\n');
    // One group: a bot with its own group would otherwise ignore the Disallow lines of `*`.
    expect(txt.match(/Allow: \//g)).toHaveLength(1);
    expect(txt.trimEnd().endsWith('Sitemap: https://example.org/sitemap.xml')).toBe(true);
  });
});

describe('buildLlmsTxt', () => {
  const txt = buildLlmsTxt({ base });

  it('follows the llmstxt.org layout with absolute links', () => {
    expect(txt.startsWith('# GERP DJ\n\n> ')).toBe(true);
    expect(txt).toContain('\n## Servicios\n');
    expect(txt).toContain('\n## Galego\n');
    expect(txt).toContain('\n## Optional\n');
    expect(txt).toContain('- [Fiestas populares](https://example.org/#servicios): ');
    expect(txt).toContain('(https://example.org/contratacion/)');
    expect(txt).toContain('(https://example.org/gl/bio/)');
    expect(txt).toContain('(https://example.org/galeria/)');
    expect(txt).toContain('(https://example.org/gl/galeria/)');
    expect(txt).toContain('(https://example.org/press/dossier-gerp-dj-es.pdf)');
    expect(txt).toContain('(https://example.org/press/dossier-gerp-dj-gl.pdf)');
    expect(txt).toContain('+34 613 34 05 00');
    for (const [, url] of txt.matchAll(/\]\(([^)]+)\)/g)) expect(url.startsWith('https://')).toBe(true);
  });

  it('has no placeholders and no disabled features', () => {
    expect(txt).not.toMatch(/\{\w+\}/);
    expect(txt).not.toMatch(/gira|musica|sesiones|dossier\/|\/og\//);
  });
});

describe('breadcrumbs (Google BreadcrumbList)', () => {
  const base = 'https://example.org';
  const crumbs = (locale: 'es' | 'gl', path: string) =>
    buildGraph({ base, locale, path, title: 'T', description: 'D' })['@graph'].find(
      (n) => n['@type'] === 'BreadcrumbList',
    ) as { '@id': string; itemListElement: unknown[] } | undefined;

  it('gives inner pages Home › Page with absolute, localized URLs and names', () => {
    expect(crumbs('es', '/contratacion/')).toEqual({
      '@type': 'BreadcrumbList',
      '@id': 'https://example.org/contratacion/#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://example.org/' },
        { '@type': 'ListItem', position: 2, name: 'Contratación', item: 'https://example.org/contratacion/' },
      ],
    });
    expect(crumbs('gl', '/gl/galeria/')?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://example.org/gl/' },
      { '@type': 'ListItem', position: 2, name: 'Galería', item: 'https://example.org/gl/galeria/' },
    ]);
  });

  it('links the page node to its breadcrumb; the home pages get a one-item list', () => {
    const graph = buildGraph({ base, locale: 'es', path: '/bio/', title: 'T', description: 'D' });
    expect(byType(graph, 'AboutPage').breadcrumb).toEqual({ '@id': 'https://example.org/bio/#breadcrumb' });
    expect(crumbs('es', '/')?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://example.org/' },
    ]);
    expect(crumbs('gl', '/gl/')?.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://example.org/gl/' },
    ]);
  });

  it('leaves the privacy and cookie policies without breadcrumbs', () => {
    for (const path of ['/privacidad/', '/cookies/', '/gl/privacidad/', '/gl/cookies/'])
      expect(crumbs(path.startsWith('/gl/') ? 'gl' : 'es', path)).toBeUndefined();
  });
});

describe('FAQPage (visible FAQ on the booking page only)', () => {
  const base = 'https://example.org';
  const faq = (locale: 'es' | 'gl', path: string) =>
    buildGraph({ base, locale, path, title: 'T', description: 'D' })['@graph'].find((n) => n['@type'] === 'FAQPage') as
      | { '@id': string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
      | undefined;

  it('lists the questions and answers in the page language, filled from site.ts', () => {
    const es = faq('es', '/contratacion/');
    expect(es?.['@id']).toBe('https://example.org/contratacion/#faq');
    expect(es?.mainEntity).toHaveLength(6);
    expect(es?.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: '¿Cómo reservo una fecha?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Escribe por WhatsApp al +34 613 34 05 00 con el día, el lugar y el tipo de celebración, o rellena el formulario de esta página, que prepara el mensaje por ti. Recibirás respuesta en 48 horas laborables.',
      },
    });
    expect(faq('gl', '/gl/contratacion/')?.mainEntity[1].acceptedAnswer.text).toBe(
      'Unha actuación custa normalmente entre 300 e 500 €. O prezo final depende da celebración; pide o teu orzamento por WhatsApp.',
    );
    expect(JSON.stringify(es)).not.toMatch(/\{\w+\}/);
  });

  it('is not repeated on other pages', () => {
    for (const path of ['/', '/bio/', '/galeria/', '/privacidad/']) expect(faq('es', path)).toBeUndefined();
  });
});

describe('site images (CDN)', () => {
  it('serves every manifest path from the CDN base', () => {
    expect(site.image('/images/gerp-dj-fiesta-aldea-ourense-640.avif')).toBe(
      'https://cdn.gerp-dj.com/images/gerp-dj-fiesta-aldea-ourense-640.avif',
    );
  });
});

describe('site videos (CDN)', () => {
  const cdn = 'https://cdn.gerp-dj.com';

  it('lists exactly the client videos published on the CDN', () => {
    expect(site.cdn).toBe(cdn);
    expect(site.videos.map((v) => v.name).sort()).toEqual([
      'gerp-dj-fiesta-aldea-ourense',
      'gerp-dj-fiesta-sala-ourense-vertical',
      'gerp-dj-fiesta-terraza-invitados-ourense',
      'gerp-dj-mezcla-controladora-ourense-vertical',
      'gerp-dj-montaje-equipo-casa-ourense-vertical',
      'gerp-dj-montaje-luces-casa-ourense',
      'gerp-dj-sesion-luces-casa-ourense',
      'gerp-dj-sesion-pub-ourense-vertical',
      'gerp-dj-sesion-terraza-microfono-ourense',
      'gerp-dj-sesion-terraza-ourense',
    ]);
  });

  it('derives every URL from the CDN base and the SEO file name', () => {
    for (const { name } of site.videos) expect(site.video(name)).toBe(`${cdn}/videos/${name}.mp4`);
  });

  it('hero and En acción loops are entries of the list, each with a poster master', () => {
    const names = site.videos.map((v) => v.name);
    expect(names).toContain(site.media.hero);
    expect(names).toContain(site.media.action);
    for (const { name } of site.videos) expect(manifest).toHaveProperty([`/images/${name}.webp`]);
  });

  it('marks vertical clips as portrait', () => {
    for (const { name, orientation } of site.videos)
      expect([name, orientation]).toEqual([name, name.endsWith('-vertical') ? 'portrait' : 'landscape']);
  });
});
