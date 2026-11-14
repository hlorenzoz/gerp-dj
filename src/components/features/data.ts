import { getCollection } from 'astro:content';
import { type Locale, site } from '../../config/site';
import { localizePath } from '../../i18n';
import { splitShows, type Zone } from '../../lib/shows';

/** A tour entry already localized and formatted on the server, so islands get plain serializable strings. */
export interface ShowRow {
  id: string;
  iso: string;
  day: string;
  month: string;
  city: string;
  province?: string;
  venue: string;
  event: string;
  zone: Zone;
  status: 'onsale' | 'soldout' | 'free';
  ticketUrl?: string;
}

// Shows are local to Spain: format in its time zone so the build machine's zone never shifts a date.
const fmt = (locale: Locale, date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale === 'gl' ? 'gl-ES' : 'es-ES', { timeZone: 'Europe/Madrid', ...options }).format(date);

export async function getShows(locale: Locale) {
  const entries = (await getCollection('tour')).map((e) => ({ id: e.id, ...e.data }));
  // shortcut: upcoming/past are split at build time; redeploy (e.g. daily) once tour is enabled so passed shows move to "past".
  const { upcoming, past } = splitShows(entries, Date.now());
  const row = (s: (typeof entries)[number]): ShowRow => ({
    id: s.id,
    iso: s.date.toISOString(),
    day: fmt(locale, s.date, { day: '2-digit' }),
    month: `${fmt(locale, s.date, { month: 'short' })} ${fmt(locale, s.date, { year: '2-digit' })}`,
    city: s.city[locale],
    province: s.province !== s.city[locale] ? s.province : undefined,
    venue: s.venue,
    event: s.event[locale],
    zone: s.zone,
    status: s.status,
    ticketUrl: s.ticketUrl,
  });
  const first = upcoming[0];
  const next = first && {
    ms: first.date.getTime(),
    where: `${first.city[locale]} · ${first.venue}`,
    when: fmt(locale, first.date, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }),
    href: first.ticketUrl ?? localizePath('/gira', locale),
    external: Boolean(first.ticketUrl),
  };
  return { upcoming: upcoming.map(row), past: past.map(row), next };
}

const newestFirst = (a: { date: Date }, b: { date: Date }) => +b.date - +a.date;

/** Releases newest first, with the display year. */
export const getReleases = async () =>
  (await getCollection('releases'))
    .map((e) => ({ id: e.id, ...e.data, year: e.data.date.getUTCFullYear() }))
    .sort(newestFirst);
export type Release = Awaited<ReturnType<typeof getReleases>>[number];

export const platformNames = {
  spotify: 'Spotify',
  apple: 'Apple Music',
  beatport: 'Beatport',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
} as const;

export const releaseLinks = (r: Release) =>
  Object.entries(r.links ?? {}).flatMap(([k, href]) =>
    href ? [{ href, label: platformNames[k as keyof typeof platformNames] }] : [],
  );

/** Sets newest first; the first one is featured on the home page. */
export const getSets = async (locale: Locale) =>
  (await getCollection('sets')).map((e) => ({ ...e.data, id: e.id, title: e.data.title[locale] })).sort(newestFirst);

/** Spanish slug → feature flag. Only enabled features get a page (see src/pages/[feature].astro). */
export const featureRoutes = { gira: 'tour', musica: 'music', sesiones: 'sets' } as const;
export type FeatureName = (typeof featureRoutes)[keyof typeof featureRoutes];

export const featurePaths = () =>
  Object.entries(featureRoutes)
    .filter(([, name]) => site.features[name])
    .map(([feature, name]) => ({ params: { feature }, props: { name } }));
