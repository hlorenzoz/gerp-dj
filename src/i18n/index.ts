import type { Locale } from '../config/site';
import es from './es';
import gl from './gl';

export type { Locale };
export type Key = keyof typeof es;

export const locales: Locale[] = ['es', 'gl'];
export const defaultLocale: Locale = 'es';

const dictionaries: Record<Locale, Record<Key, string>> = { es, gl };

export const getLocale = (currentLocale: string | undefined): Locale => (currentLocale === 'gl' ? 'gl' : 'es');

export const useT = (locale: Locale) => (key: Key) => dictionaries[locale][key];

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
