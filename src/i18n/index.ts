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
  const clean = unlocalize(path);
  return locale === defaultLocale ? clean : `/gl${clean}`;
}

/** The same page in another locale (used by the ES | GL switcher and hreflang). */
export const alternatePath = (currentPath: string, targetLocale: Locale) => localizePath(currentPath, targetLocale);
