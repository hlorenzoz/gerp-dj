import { describe, expect, it } from 'vitest';
import { alternatePath, localizePath } from './index';

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
