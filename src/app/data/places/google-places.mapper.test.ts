import { expect, test } from 'vitest';
import { ME_ON_MAP, type GooglePlace, distanceKm, kindOf, pinOf, toPlace } from './google-places.mapper.ts';

const lima = { latitude: -12.0464, longitude: -77.0428 };

test('distance between two points is in kilometres', () => {
  expect(distanceKm(lima, lima)).toBe(0);
  // One degree of latitude is about 111 km.
  expect(distanceKm(lima, { latitude: -11.0464, longitude: -77.0428 })).toBeGreaterThan(110);
  expect(distanceKm(lima, { latitude: -11.0464, longitude: -77.0428 })).toBeLessThan(112);
});

test('Google types decide vet or shop; anything else keeps the kind that was asked for', () => {
  expect(kindOf(['veterinary_care', 'point_of_interest'], 'shop')).toBe('vet');
  expect(kindOf(['pet_store'], 'vet')).toBe('shop');
  expect(kindOf(['establishment'], 'groomer')).toBe('groomer');
  expect(kindOf(undefined, 'vet')).toBe('vet');
});

test('a place east and north of me lands to the right of and above the "me" dot', () => {
  const pin = pinOf(lima, { latitude: lima.latitude + 0.01, longitude: lima.longitude + 0.01 }, 3);
  expect(pin.x).toBeGreaterThan(ME_ON_MAP.x);
  expect(pin.y).toBeLessThan(ME_ON_MAP.y);
});

test('a place far outside the radius still stays inside the map frame', () => {
  const pin = pinOf(lima, { latitude: lima.latitude + 5, longitude: lima.longitude - 5 }, 3);
  expect(pin.x).toBeGreaterThanOrEqual(6);
  expect(pin.y).toBeGreaterThanOrEqual(8);
});

const raw: GooglePlace = {
  id: 'abc',
  displayName: { text: 'Veterinaria San Roque' },
  location: { latitude: lima.latitude + 0.005, longitude: lima.longitude },
  rating: 4.9,
  types: ['veterinary_care'],
  shortFormattedAddress: 'Av. Arequipa 123',
  nationalPhoneNumber: '(01) 555 0100',
  currentOpeningHours: { openNow: true },
};

test('converts a Google place to the app\'s own', () => {
  const place = toPlace(raw, lima, 3, 'vet')!;

  expect(place).toMatchObject({
    id: 'abc', name: 'Veterinaria San Roque', kind: 'vet', tagline: 'Av. Arequipa 123',
    openLabel: 'Abierto ahora', open: true, rating: 4.9, phone: '(01) 555 0100',
  });
  expect(place.distanceKm).toBeGreaterThan(0.5);
  expect(place.distanceKm).toBeLessThan(0.6);
});

test('missing data is said plainly, never invented', () => {
  const place = toPlace({ id: 'x', displayName: { text: 'Sin datos' }, location: lima }, lima, 3, 'shop')!;

  expect(place.openLabel).toBe('Horario no disponible');
  expect(place.open).toBe(false);
  expect(place.rating).toBeNull();
  expect(place.phone).toBe('');
});

test('a place without a position or a name is left out', () => {
  expect(toPlace({ id: 'x', displayName: { text: 'A' } }, lima, 3, 'vet')).toBeNull();
  expect(toPlace({ id: 'x', location: lima }, lima, 3, 'vet')).toBeNull();
});

test('a text-search result keeps the kind that was searched for', () => {
  const groomer = toPlace({ ...raw, types: ['pet_store'] }, lima, 3, 'groomer', true)!;
  expect(groomer.kind).toBe('groomer');
});
