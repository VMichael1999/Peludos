import { expect, test } from 'vitest';
import { toPlace } from './google-places.mapper.ts';
import { fromLegacy, isRefusal, parseLegacy } from './google-places-legacy.mapper.ts';

const lima = { latitude: -12.0464, longitude: -77.0428 };
const raw = {
  place_id: 'abc', name: 'Zoofarma', geometry: { location: { lat: -12.0646, lng: -77.0338 } }, rating: 4.3,
  types: ['pet_store', 'veterinary_care'], vicinity: 'Av. Paseo de la República 668, Lima', opening_hours: { open_now: true },
};

test('a classic result becomes a place through the same conversion as the new API', () => {
  const place = toPlace(fromLegacy(raw)!, lima, 3, 'shop')!;

  expect(place).toMatchObject({ id: 'abc', name: 'Zoofarma', kind: 'vet', tagline: 'Av. Paseo de la República 668, Lima', open: true, rating: 4.3, phone: '' });
  expect(place.distanceKm).toBeGreaterThan(2);
});

test('what the result does not say stays unsaid', () => {
  const place = toPlace(fromLegacy({ place_id: 'x', name: 'Sin datos', geometry: { location: { lat: -12.05, lng: -77.04 } } })!, lima, 3, 'vet')!;

  expect(place.openLabel).toBe('Horario no disponible');
  expect(place.rating).toBeNull();
});

test('a result with no position, no name or permanently closed is left out', () => {
  expect(fromLegacy({ place_id: 'a', name: 'A' })).toBeNull();
  expect(fromLegacy({ place_id: 'a', geometry: raw.geometry })).toBeNull();
  expect(fromLegacy({ ...raw, business_status: 'CLOSED_PERMANENTLY' })).toBeNull();
});

test('parses an answer, and anything unexpected yields none', () => {
  expect(parseLegacy({ status: 'OK', results: [raw, { place_id: 'bad' }] })).toHaveLength(1);
  expect(parseLegacy(null)).toEqual([]);
  expect(parseLegacy({ results: 'no' })).toEqual([]);
});

test('a refusal is told apart from an empty answer', () => {
  expect(isRefusal({ status: 'REQUEST_DENIED' })).toBe(true);
  expect(isRefusal({ status: 'OVER_QUERY_LIMIT' })).toBe(true);
  expect(isRefusal({ status: 'ZERO_RESULTS', results: [] })).toBe(false);
  expect(isRefusal({ status: 'OK' })).toBe(false);
});
