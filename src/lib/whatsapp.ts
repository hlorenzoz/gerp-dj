import { type Locale, site } from '../config/site';
import { useT } from '../i18n';

export const EVENT_TYPES = ['popular', 'wedding', 'private', 'corporate', 'other'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface BookingInput {
  name: string;
  date: string;
  venue: string;
  type: EventType;
  msg?: string;
}
export interface AvailabilityInput {
  date: string;
  place: string;
  type: EventType;
}

export const waLink = (text?: string) =>
  `https://wa.me/${site.contact.waNumber}` + (text ? `?text=${encodeURIComponent(text)}` : '');

/** dd/mm/yyyy built by hand: Intl may lack Galician locale data and silently fall back to English. */
export const formatDate = (isoDate: string) => isoDate.split('-').reverse().join('/');

export const eventTypes = (locale: Locale) => {
  const t = useT(locale);
  return EVENT_TYPES.map((value) => ({ value, label: t(`f.${value}`) }));
};

// Booking keeps the raw yyyy-mm-dd date, exactly as the prototype does.
export function bookingMessage(locale: Locale, { name, date, venue, type, msg }: BookingInput) {
  const t = useT(locale);
  return [
    t('wa.hello'),
    `${t('wa.name')}: ${name}`,
    `${t('wa.date')}: ${date}`,
    `${t('wa.venue')}: ${venue}`,
    `${t('wa.type')}: ${t(`f.${type}`)}`,
    msg && `\n${msg}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function availabilityMessage(locale: Locale, { date, place, type }: AvailabilityInput) {
  const t = useT(locale);
  return [
    t('wa.avail'),
    `${t('wa.date')}: ${formatDate(date)}`,
    `${t('wa.place')}: ${place}`,
    `${t('wa.type')}: ${t(`f.${type}`)}`,
  ].join('\n');
}

/** Quote request for a service (site.services order: popular fiesta, wedding, private party, corporate event). */
export const serviceMessage = (locale: Locale, id: (typeof site.services)[number]) => useT(locale)(`svc.${id}.msg`);

export const pressMessage = (locale: Locale) => useT(locale)('c.pressMsg');
