import { describe, expect, it } from 'vitest';
import es from './es';
import gl from './gl';
import { alternatePath, formatDays, formatLongDate, type Key, locales, localizePath, siteVars, useT } from './index';

describe('localizePath', () => {
  it('adds the trailing slash Workers static assets expect (avoids a 307 per click)', () => {
    expect(localizePath('/bio', 'es')).toBe('/bio/');
    expect(localizePath('/bio', 'gl')).toBe('/gl/bio/');
    expect(localizePath('/contratacion/', 'gl')).toBe('/gl/contratacion/');
  });

  it('keeps the home paths and section anchors', () => {
    expect(localizePath('/', 'es')).toBe('/');
    expect(localizePath('/', 'gl')).toBe('/gl/');
    expect(localizePath('/#servicios', 'es')).toBe('/#servicios');
    expect(localizePath('/#servicios', 'gl')).toBe('/gl/#servicios');
  });

  it('leaves file paths untouched', () => {
    expect(localizePath('/press/dossier-gerp-dj-es.pdf', 'es')).toBe('/press/dossier-gerp-dj-es.pdf');
  });
});

describe('alternatePath', () => {
  it('maps the current page to the other locale', () => {
    expect(alternatePath('/gl/bio/', 'es')).toBe('/bio/');
    expect(alternatePath('/privacidad/', 'gl')).toBe('/gl/privacidad/');
    expect(alternatePath('/gl/', 'es')).toBe('/');
  });

  it('sends the 404 page to the home of the other locale (there is no /gl/404/)', () => {
    expect(alternatePath('/404', 'gl')).toBe('/gl/');
    expect(alternatePath('/404.html', 'es')).toBe('/');
  });
});

describe('site data formatting (by hand: headless Chrome lacks Galician Intl data)', () => {
  it('writes long dates per locale', () => {
    expect(formatLongDate('2026-11-14', 'es')).toBe('14 de noviembre de 2026');
    expect(formatLongDate('2026-11-14', 'gl')).toBe('14 de novembro de 2026');
    expect(formatLongDate('2027-01-05', 'gl')).toBe('5 de xaneiro de 2027');
  });

  it('writes a day range per locale', () => {
    expect(formatDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'es')).toBe('Lunes a viernes');
    expect(formatDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'gl')).toBe('Luns a venres');
  });
});

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('useT', () => {
  it('interpolates the business data from src/config/site.ts', () => {
    expect(useT('es')('c.hours')).toBe('Lunes a viernes, de 10:00 a 19:00. Respuesta en 48 horas laborables.');
    expect(useT('gl')('c.hours')).toBe('Luns a venres, de 10:00 a 19:00. Resposta en 48 horas laborables.');
    expect(useT('es')('ui.title')).toBe('GERP DJ — DJ en Ourense');
    expect(useT('gl')('footer.copy')).toBe('© 2026 GERP DJ · DJ en Ourense, Galicia');
  });

  it('accepts extra variables', () => {
    expect(useT('es')('cta.bookFull', { brand: 'X' })).toBe('Contratar a X');
  });

  it('knows every placeholder used in the dictionaries', () => {
    const known = Object.keys(siteVars('es'));
    for (const dict of [es, gl])
      for (const text of Object.values(dict)) expect(known).toEqual(expect.arrayContaining(placeholders(text)));
    for (const locale of locales)
      for (const key of Object.keys(es) as Key[]) expect(useT(locale)(key)).not.toMatch(/\{\w+\}/);
  });

  it('uses the same data in Spanish and Galician (same placeholders per key)', () => {
    for (const key of Object.keys(es) as Key[])
      expect([key, placeholders(gl[key])]).toEqual([key, placeholders(es[key])]);
  });

  it('no dictionary repeats a business fact that site.ts owns', () => {
    for (const dict of [es, gl])
      for (const text of Object.values(dict))
        expect(text).not.toMatch(/GERP DJ|Ourense|Galicia|613|10:00|19:00|48 horas|12 meses|2026-11-14/);
  });
});
