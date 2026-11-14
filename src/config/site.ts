'';
// ({brand}, {city}, {phone}…); pages, legal texts, WhatsApp messages, OpenGraph, JSON-LD, llms.txt, sitemap and
// the press kit read them from here.
export type Locale = 'es' | 'gl';

const whatsappE164 = '+34613340500';
// SITE_URL only overrides the production domain (previews). Read through globalThis: this module also ships to
// Svelte islands, where `process` does not exist.
const siteUrl = (globalThis.process?.env.SITE_URL?.trim() || 'https://gerp-dj.com').replace(/\/+$/, '');
const cdn = 'https://cdn.gerp-dj.com';

export const site = {
  brand: 'GERP DJ',
  /** Site origin without trailing slash: the production domain unless the SITE_URL build variable overrides it. */
  url: siteUrl,
  contact: {
    whatsappE164,
    /** wa.me wants the full international number as digits only (no +, spaces or leading 0). */
    waNumber: whatsappE164.replace(/\D/g, ''),
    display: '+34 613 34 05 00',
  },
  channelUrl: 'https://whatsapp.com/channel/CHANNEL_ID', // placeholder until the client creates the channel
  /** Reply time promised for WhatsApp requests, in working hours. */
  responseHours: 48,
  /** When WhatsApp requests are answered (schema.org day names). */
  hours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '19:00' },
  location: {
    locality: 'Ourense',
    region: 'Galicia',
    countryCode: 'ES',
    /** Market focus in order: Ourense first, then the rest of Galicia. */
    areaServed: [
      { type: 'City', name: 'Ourense' },
      { type: 'AdministrativeArea', name: 'Galicia' },
    ],
  },
  /** Business address (structured data + footer). Locality from postal code 32643 (Porqueira) — confirm with the client. */
  address: {
    street: 'Carretera Xinzo de Limia, Avande No 2',
    postalCode: '32643',
    locality: 'Porqueira',
    province: 'Ourense',
  },
  /** Typical booking price, schema.org `priceRange` format. */
  priceRange: '€300-500',
  /** Service ids in display order; copy lives in the dictionaries as `svc.<id>.t|d|msg`. */
  services: ['popular', 'wedding', 'private', 'corporate'],
  /** Own equipment in display order; labels are `kit.<id>`. */
  kit: ['booth', 'sound', 'lights', 'mic', 'controller'],
  languages: ['es', 'gl'],
  legal: { retentionMonths: 12, updated: '2026-11-14' },
  /** Video host (Cloudflare R2 on the brand's own domain). Every video URL is derived from it. */
  cdn,
  video: (name: string) => `${cdn}/videos/${name}.mp4`,
  /** Manifest path (`/images/<file>`) → CDN URL. Every image variant is mirrored there by `just cdn-images`. */
  image: (path: string) => `${cdn}${path}`,
  /** Client videos on the CDN in gallery order (strongest first). `name` is the file name and the poster master in
   * public/images; `title` and `caption` are i18n keys. */
  videos: [
    { name: 'gerp-dj-sesion-pub-ourense-vertical', orientation: 'portrait', title: 'vid.pub', caption: 'vid.pubMeta' },
    {
      name: 'gerp-dj-sesion-terraza-ourense',
      orientation: 'landscape',
      title: 'action.cap',
      caption: 'action.capMeta',
    },
    {
      name: 'gerp-dj-sesion-terraza-microfono-ourense',
      orientation: 'landscape',
      title: 'vid.mic',
      caption: 'vid.micMeta',
    },
    {
      name: 'gerp-dj-fiesta-aldea-ourense',
      orientation: 'landscape',
      title: 'action.cap2',
      caption: 'action.cap2Meta',
    },
    {
      name: 'gerp-dj-fiesta-sala-ourense-vertical',
      orientation: 'portrait',
      title: 'vid.club',
      caption: 'vid.clubMeta',
    },
    {
      name: 'gerp-dj-mezcla-controladora-ourense-vertical',
      orientation: 'portrait',
      title: 'vid.mix',
      caption: 'vid.mixMeta',
    },
    {
      name: 'gerp-dj-montaje-luces-casa-ourense',
      orientation: 'landscape',
      title: 'vid.setup',
      caption: 'vid.setupMeta',
    },
    { name: 'gerp-dj-sesion-luces-casa-ourense', orientation: 'landscape', title: 'vid.home', caption: 'vid.homeMeta' },
    {
      name: 'gerp-dj-montaje-equipo-casa-ourense-vertical',
      orientation: 'portrait',
      title: 'vid.walk',
      caption: 'vid.walkMeta',
    },
    {
      name: 'gerp-dj-fiesta-terraza-invitados-ourense',
      orientation: 'landscape',
      title: 'vid.guests',
      caption: 'vid.guestsMeta',
    },
  ],
  media: {
    /** Hero still + muted loop and the En acción loop: names from `videos`. */
    hero: 'gerp-dj-fiesta-aldea-ourense',
    action: 'gerp-dj-sesion-terraza-ourense',
    og: { src: '/og/gerp-dj.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'og.alt' },
  },
  press: {
    pdf: (locale: Locale) => `/press/dossier-gerp-dj-${locale}.pdf`,
    /** Print-only press kit source (noindex); `just press` turns it into the PDFs above. */
    source: (locale: Locale) => `/dossier/${locale}/`,
  },
  /** Every public page, once. Feature pages exist only while their flag is on. Titles and descriptions are i18n keys;
   * `type` is the schema.org WebPage subtype, `legal` pages are not about the business and go last in llms.txt. */
  pages: [
    { path: '/', title: 'ui.title', description: 'meta.description' },
    { path: '/contratacion', title: 'book.title', description: 'meta.book', type: 'ContactPage' },
    { path: '/gira', title: 'nav.tour', description: 'meta.tour', feature: 'tour' },
    { path: '/musica', title: 'nav.music', description: 'meta.music', feature: 'music' },
    { path: '/sesiones', title: 'nav.sets', description: 'meta.sets', feature: 'sets' },
    { path: '/galeria', title: 'nav.gallery', description: 'meta.gallery', type: 'CollectionPage' },
    { path: '/bio', title: 'nav.bio', description: 'meta.bio', type: 'AboutPage' },
    { path: '/privacidad', title: 'legal.privacy', description: 'meta.privacy', legal: true },
    { path: '/cookies', title: 'legal.cookies', description: 'meta.cookies', legal: true },
  ],
  /** Print and image routes that are built but must never be indexed or listed. */
  noindexPaths: ['/dossier/', '/og/card/'],
  // Hidden, not deleted: a disabled feature is neither built nor linked.
  features: { tour: false, music: false, sets: false, shop: false, socials: true },
  shopUrl: 'https://shop.example.com', // placeholder
  /** Official profiles: footer links and JSON-LD `sameAs`. */
  socials: [
    { name: 'YouTube', url: 'https://www.youtube.com/@youtGERPDJ' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@gerpdj' },
  ],
} as const;

export type Site = typeof site;
export type Page = Site['pages'][number];

/** Public pages whose feature flag (if any) is on. */
export const enabledPages = (features: Record<keyof Site['features'], boolean> = site.features): Page[] =>
  site.pages.filter((p) => !('feature' in p) || features[p.feature]);
