import { describe, expect, it } from 'vitest';
import { availabilityMessage, bookingMessage, eventTypes, formatDate, pressMessage, serviceMessages, waLink } from './whatsapp';

const booking = { name: 'Ana Pérez', date: '2027-05-01', venue: 'Ourense, Pazo de exemplo', type: 'wedding', msg: 'Set de 3 horas' } as const;
const availability = { date: '2027-06-12', place: 'Celanova', type: 'popular' } as const;

describe('waLink', () => {
  it('links to the business number without text', () => {
    expect(waLink()).toBe('https://wa.me/34613340500');
    expect(waLink('')).toBe('https://wa.me/34613340500');
  });

  it('encodes the prefilled text', () => {
    expect(waLink('Hola, ¿qué tal?\n&')).toBe('https://wa.me/34613340500?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F%0A%26');
  });
});

describe('formatDate', () => {
  it('formats yyyy-mm-dd as dd/mm/yyyy', () => {
    expect(formatDate('2027-06-12')).toBe('12/06/2027');
  });
});

describe('bookingMessage', () => {
  it('builds the Spanish request', () => {
    expect(bookingMessage('es', booking)).toBe('Hola, quiero contratar a GERP DJ.\nNombre: Ana Pérez\nFecha: 2027-05-01\nLocalidad y lugar: Ourense, Pazo de exemplo\nTipo de evento: Boda\n\nSet de 3 horas');
  });

  it('builds the Galician request', () => {
    expect(bookingMessage('gl', booking)).toBe('Ola, quero contratar a GERP DJ.\nNome: Ana Pérez\nData: 2027-05-01\nLocalidade e lugar: Ourense, Pazo de exemplo\nTipo de evento: Voda\n\nSet de 3 horas');
  });

  it('omits the message line when it is empty', () => {
    expect(bookingMessage('es', { ...booking, msg: '' })).toBe('Hola, quiero contratar a GERP DJ.\nNombre: Ana Pérez\nFecha: 2027-05-01\nLocalidad y lugar: Ourense, Pazo de exemplo\nTipo de evento: Boda');
  });
});

describe('availabilityMessage', () => {
  it('builds the Spanish question', () => {
    expect(availabilityMessage('es', availability)).toBe('Hola, ¿tiene GERP DJ disponible esta fecha?\nFecha: 12/06/2027\nLocalidad: Celanova\nTipo de evento: Fiesta popular');
  });

  it('builds the Galician question', () => {
    expect(availabilityMessage('gl', availability)).toBe('Ola, ten GERP DJ dispoñible esta data?\nData: 12/06/2027\nLocalidade: Celanova\nTipo de evento: Festa popular');
  });
});

describe('event types', () => {
  it('labels every type in both languages', () => {
    expect(eventTypes('es')).toEqual([
      { value: 'popular', label: 'Fiesta popular' },
      { value: 'wedding', label: 'Boda' },
      { value: 'private', label: 'Fiesta privada' },
      { value: 'corporate', label: 'Empresa' },
      { value: 'other', label: 'Otro' },
    ]);
    expect(eventTypes('gl').map((t) => t.label)).toEqual(['Festa popular', 'Voda', 'Festa privada', 'Empresa', 'Outro']);
  });
});

describe('serviceMessages', () => {
  it('starts with the popular-fiesta quote', () => {
    expect(serviceMessages.es[0]).toBe('Hola, quiero presupuesto para una fiesta popular.');
    expect(serviceMessages.gl[0]).toBe('Ola, quero orzamento para unha festa popular.');
    expect(serviceMessages.es).toHaveLength(4);
    expect(serviceMessages.gl).toHaveLength(4);
  });
});

describe('pressMessage', () => {
  it('opens a press chat in each language', () => {
    expect(pressMessage('es')).toBe('Hola, escribo por un tema de prensa sobre GERP DJ.');
    expect(pressMessage('gl')).toBe('Ola, escribo por un tema de prensa sobre GERP DJ.');
  });
});
