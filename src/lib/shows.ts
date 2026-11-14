export const zones = ['all', 'ourense', 'galicia', 'espana'] as const;
export type ZoneFilter = (typeof zones)[number];
export type Zone = Exclude<ZoneFilter, 'all'>;

/** Upcoming shows soonest first, past shows most recent first. A show starting exactly `now` is past. */
export function splitShows<T extends { date: Date }>(shows: T[], now: Date | number) {
  const t = +now;
  return {
    upcoming: shows.filter((s) => +s.date > t).sort((a, b) => +a.date - +b.date),
    past: shows.filter((s) => +s.date <= t).sort((a, b) => +b.date - +a.date),
  };
}

export const filterByZone = <T extends { zone: Zone }>(shows: T[], zone: ZoneFilter) =>
  zone === 'all' ? shows : shows.filter((s) => s.zone === zone);

/** Time left until `targetMs`, clamped at zero, each part zero-padded to two digits. */
export function countdownParts(targetMs: number, nowMs: number) {
  const s = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    d: pad(Math.floor(s / 86400)),
    h: pad(Math.floor((s % 86400) / 3600)),
    m: pad(Math.floor((s % 3600) / 60)),
    s: pad(s % 60),
  };
}
