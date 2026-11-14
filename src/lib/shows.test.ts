import { describe, expect, it } from 'vitest';
import { countdownParts, filterByZone, splitShows } from './shows';

const show = (id: string, iso: string, zone: 'ourense' | 'galicia' | 'espana') => ({ id, date: new Date(iso), zone });
const shows = [
  show('vigo', '2026-11-28T23:00:00+01:00', 'galicia'),
  show('samain', '2026-10-31T23:30:00+01:00', 'ourense'),
  show('madrid', '2027-03-06T23:00:00+01:00', 'espana'),
  show('carballino', '2026-09-12T23:00:00+02:00', 'ourense'),
  show('burgas', '2026-11-21T23:30:00+01:00', 'ourense'),
];
const now = new Date('2026-11-14T12:00:00+01:00');
const ids = (list: { id: string }[]) => list.map((s) => s.id);

describe('splitShows', () => {
  it('returns upcoming shows in ascending date order', () => {
    expect(ids(splitShows(shows, now).upcoming)).toEqual(['burgas', 'vigo', 'madrid']);
  });

  it('returns past shows in descending date order', () => {
    expect(ids(splitShows(shows, now).past)).toEqual(['samain', 'carballino']);
  });

  it('counts a show starting exactly now as past, like the prototype', () => {
    const { upcoming, past } = splitShows([show('now', '2026-11-14T12:00:00+01:00', 'ourense')], now);
    expect(upcoming).toEqual([]);
    expect(ids(past)).toEqual(['now']);
  });

  it('accepts a timestamp and does not reorder the input', () => {
    const input = [...shows];
    expect(ids(splitShows(input, now.getTime()).upcoming)).toEqual(['burgas', 'vigo', 'madrid']);
    expect(input).toEqual(shows);
  });
});

describe('filterByZone', () => {
  it('keeps every show for "all"', () => {
    expect(filterByZone(shows, 'all')).toEqual(shows);
  });

  it('keeps only the shows of the selected zone', () => {
    expect(ids(filterByZone(shows, 'ourense'))).toEqual(['samain', 'carballino', 'burgas']);
    expect(ids(filterByZone(shows, 'galicia'))).toEqual(['vigo']);
    expect(ids(filterByZone(shows, 'espana'))).toEqual(['madrid']);
  });
});

describe('countdownParts', () => {
  const start = Date.UTC(2026, 10, 14, 12, 0, 0);

  it('splits the remaining time into zero-padded days, hours, minutes and seconds', () => {
    const target = start + ((3 * 24 + 4) * 3600 + 5 * 60 + 6) * 1000;
    expect(countdownParts(target, start)).toEqual({ d: '03', h: '04', m: '05', s: '06' });
  });

  it('floors partial seconds and keeps more than 99 days unpadded', () => {
    expect(countdownParts(start + 120 * 86400_000 + 999, start)).toEqual({ d: '120', h: '00', m: '00', s: '00' });
  });

  it('clamps at zero once the show has started', () => {
    expect(countdownParts(start - 5000, start)).toEqual({ d: '00', h: '00', m: '00', s: '00' });
  });
});
