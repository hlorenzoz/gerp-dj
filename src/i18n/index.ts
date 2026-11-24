import { type Locale, site } from '../config/site';
import es from './es';
import gl from './gl';

export type { Locale };
export type Key = keyof typeof es;

export const locales: Locale[] = ['es', 'gl'];
export const defaultLocale: Locale = 'es';

const dictionaries: Record<Locale, Record<Key, string>> = { es, gl };

export const getLocale = (currentLocale: string | undefined): Locale => (currentLocale === 'gl' ? 'gl' : 'es');

// Dates and day names are written by hand: Intl may lack Galician data (headless Chrome does) and fall back to English.
const months = {
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  gl: [
    'xaneiro',
    'febreiro',
    'marzo',
    'abril',
    'maio',
    'xuño',
    'xullo',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'decembro',
  ],
} satisfies Record<Locale, string[]>;
const weekdays = {
  es: {
    Monday: 'lunes',
    Tuesday: 'martes',
    Wednesday: 'miércoles',
    Thursday: 'jueves',
    Friday: 'viernes',
    Saturday: 'sábado',
    Sunday: 'domingo',
  },
  gl: {
    Monday: 'luns',
    Tuesday: 'martes',
    Wednesday: 'mércores',
    Thursday: 'xoves',
    Friday: 'venres',
    Saturday: 'sábado',
    Sunday: 'domingo',
  },
} satisfies Record<Locale, Record<string, string>>;
type Weekday = keyof (typeof weekdays)['es'];
const countries = { ES: 'España' } as const;

/** `2026-11-14` → `14 de noviembre de 2026` / `14 de novembro de 2026`. */
export function formatLongDate(isoDate: string, locale: Locale) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} de ${months[locale][month - 1]} de ${year}`;
}

/** A consecutive day range, capitalised for the start of a sentence: `Lunes a viernes` / `Luns a venres`. */
export function formatDays(days: readonly Weekday[], locale: Locale) {
  const range = `${weekdays[locale][days[0]]} a ${weekdays[locale][days[days.length - 1]]}`;
  return range[0].toUpperCase() + range.slice(1);
}

/** Values every dictionary string may use as `{name}`; all of them come from src/config/site.ts. */
export const siteVars = (locale: Locale) => ({
  brand: site.brand,
  city: site.location.locality,
  region: site.location.region,
  country: countries[site.location.countryCode],
  phone: site.contact.display,
  responseHours: String(site.responseHours),
  priceMin: String(site.price.min),
  priceMax: String(site.price.max),
  since: String(site.experience.since),
  performances: String(site.experience.performances),
  days: formatDays(site.hours.days, locale),
  hoursFrom: site.hours.opens,
  hoursTo: site.hours.closes,
  retentionMonths: String(site.legal.retentionMonths),
  updated: formatLongDate(site.legal.updated, locale),
  year: site.legal.updated.slice(0, 4),
  web: site.url.replace(/^https?:\/\//, ''),
  channel: site.channelUrl.replace(/^https?:\/\//, ''),
});

type Vars = Record<string, string | number>;
const interpolate = (text: string, vars: Vars) =>
  text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));

/** `t(key)` returns the copy with the site data filled in; `extra` adds or overrides variables. */
export const useT = (locale: Locale) => {
  const vars: Vars = siteVars(locale);
  return (key: Key, extra?: Vars) => interpolate(dictionaries[locale][key], extra ? { ...vars, ...extra } : vars);
};

/** Strips the `/gl` prefix: `/gl/bio` → `/bio`, `/gl` → `/`. */
const unlocalize = (path: string) => path.replace(/^\/gl(?=\/|$)/, '') || '/';

/** Spanish stays unprefixed, Galician lives under `/gl/`. Accepts `/bio`, `/`, `/#servicios`. */
export function localizePath(path: string, locale: Locale): string {
  const [pathname, hash] = path.split('#');
  let clean = unlocalize(pathname);
  // Workers static assets redirect `/bio` → `/bio/` (307); link to the final URL. Files keep their extension.
  if (!clean.endsWith('/') && !/\.[a-z0-9]+$/i.test(clean)) clean += '/';
  const localized = locale === defaultLocale ? clean : `/gl${clean}`;
  return hash === undefined ? localized : `${localized}#${hash}`;
}

/** The same page in another locale (used by the ES | GL switcher and hreflang). The 404 has no /gl/404/: go home. */
export const alternatePath = (currentPath: string, targetLocale: Locale) =>
  localizePath(/^(\/gl)?\/404(\.html)?\/?$/.test(currentPath) ? '/' : currentPath, targetLocale);
