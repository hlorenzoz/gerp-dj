// Machine-readable outputs built from src/config/site.ts: JSON-LD, sitemap.xml, robots.txt and llms.txt.
// Pure functions of (base URL, pages, locale) so they can be tested without a build.
import { enabledPages, type Locale, type Page, site } from '../config/site';
import { type Key, locales, localizePath, siteVars, useT } from '../i18n';
import { waLink } from './whatsapp';

/** Absolute URL of a page in a locale, with the trailing slash the built files use. */
export const pageUrl = (path: string, locale: Locale, base = site.url) => base + localizePath(path, locale);

/** The registry entry for a built path (`/gl/bio/` → `/bio`). */
export const findPage = (path: string) =>
  site.pages.find((p) => localizePath(p.path, 'es') === localizePath(path, 'es'));

interface GraphInput {
  base?: string;
  locale: Locale;
  /** Built pathname, e.g. `/gl/contratacion/`. */
  path: string;
  title: string;
  description: string;
}

/** WebSite + EntertainmentBusiness + the current WebPage, linked by stable @ids (schema.org, Google local business). */
export function buildGraph({ base = site.url, locale, path, title, description }: GraphInput) {
  const t = useT(locale);
  const page = findPage(path);
  const home = `${base}/`;
  const ids = { website: `${base}/#website`, business: `${base}/#business` };
  const url = base + localizePath(path, locale);
  const { locality, region, countryCode, areaServed } = site.location;
  const places = areaServed.map(({ type, name }) => ({ '@type': type, name }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ids.website,
        url: home,
        name: site.brand,
        inLanguage: [...site.languages],
        publisher: { '@id': ids.business },
      },
      {
        '@type': 'EntertainmentBusiness',
        '@id': ids.business,
        name: site.brand,
        url: home,
        description: t('meta.description'),
        image: base + site.media.og.src,
        telephone: site.contact.whatsappE164,
        // Mobile DJ (service-area business): locality only, no street address.
        address: {
          '@type': 'PostalAddress',
          addressLocality: locality,
          addressRegion: region,
          addressCountry: countryCode,
        },
        areaServed: places,
        knowsLanguage: [...site.languages],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'reservations',
          telephone: site.contact.whatsappE164,
          url: waLink(),
          availableLanguage: [...site.languages],
          areaServed: places,
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [...site.hours.days],
            opens: site.hours.opens,
            closes: site.hours.closes,
          },
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: t('nav.services'),
          itemListElement: site.services.map((id) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: t(`svc.${id}.t`),
              description: t(`svc.${id}.d`),
              areaServed: places,
            },
          })),
        },
      },
      {
        '@type': (page && 'type' in page && page.type) || 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { '@id': ids.website },
        // Legal pages are about the site's policies, not about the business.
        ...(page && 'legal' in page ? {} : { about: { '@id': ids.business } }),
        primaryImageOfPage: { '@type': 'ImageObject', url: base + site.media.og.src },
      },
    ],
  };
}

const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** sitemap.xml: every enabled page in both locales, each with its hreflang alternates. */
export function buildSitemap({ base = site.url, pages = enabledPages() }: { base?: string; pages?: Page[] } = {}) {
  const urls = pages.flatMap((p) =>
    locales.map((locale) => {
      const alternates = [
        ...locales.map((l) => [l, pageUrl(p.path, l, base)]),
        ['x-default', pageUrl(p.path, 'es', base)],
      ]
        .map(([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${xmlEscape(href)}"/>`)
        .join('\n');
      return `  <url>\n    <loc>${xmlEscape(pageUrl(p.path, locale, base))}</loc>\n    <lastmod>${site.legal.updated}</lastmod>\n${alternates}\n  </url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

// Search and AI-search crawlers named explicitly so the policy is unambiguous; they share one group because a bot
// with a group of its own ignores the `*` group (and its Disallow lines).
const crawlers = [
  '*',
  'Googlebot',
  'Bingbot',
  'Google-Extended',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-SearchBot',
];

export const buildRobots = ({ base = site.url }: { base?: string } = {}) =>
  `${crawlers.map((c) => `User-agent: ${c}`).join('\n')}
Allow: /
${site.noindexPaths.map((p) => `Disallow: ${p}`).join('\n')}

Sitemap: ${base}/sitemap.xml
`;

/** llms.txt (https://llmstxt.org/): Spanish first, Galician pages listed, legal pages under `## Optional`. */
export function buildLlmsTxt({ base = site.url, pages = enabledPages() }: { base?: string; pages?: Page[] } = {}) {
  const es = useT('es');
  const gl = useT('gl');
  const v = siteVars('es');
  const link = (title: string, url: string, note: string) => `- [${title}](${url}): ${note}`;
  const entry = (p: Page, locale: Locale) => {
    const t = locale === 'es' ? es : gl;
    return link(t(p.title as Key), pageUrl(p.path, locale, base), t(p.description as Key));
  };
  const main = pages.filter((p) => !('legal' in p));
  const legal = pages.filter((p) => 'legal' in p);
  const pressEntry = (locale: Locale) => {
    const t = locale === 'es' ? es : gl;
    return link(t('press.kit'), base + site.press.pdf(locale), t('llms.press'));
  };
  return `# ${site.brand}

> ${es('meta.description')}

- ${es('about.baseK')}: ${v.city} (${v.region}, ${v.country})
- ${es('about.zoneK')}: ${es('about.zoneV')}
- ${es('about.kitK')}: ${es('about.kitV')}
- WhatsApp Business: ${site.contact.display} (${waLink()})
- ${es('c.hours')}

## ${es('nav.services')}

${site.services.map((id) => link(es(`svc.${id}.t`), pageUrl('/#servicios', 'es', base), es(`svc.${id}.d`))).join('\n')}

## ${es('llms.pages')}

${[...main.map((p) => entry(p, 'es')), pressEntry('es')].join('\n')}

## ${gl('llms.lang')}

${[...pages.map((p) => entry(p, 'gl')), pressEntry('gl')].join('\n')}

## Optional

${legal.map((p) => entry(p, 'es')).join('\n')}
`;
}
