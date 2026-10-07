import { expect, test } from 'vitest';
import { alertLocation } from './alert-location.ts';

const lima = { latitude: -12.0464, longitude: -77.0428 };
const km = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const north = (b.latitude - a.latitude) * 111.32;
  const east = (b.longitude - a.longitude) * 111.32 * Math.cos((a.latitude * Math.PI) / 180);
  return { north, east, distance: Math.hypot(north, east) };
};

test('puts an alert as far from the person as its distance says', () => {
  const at = alertLocation(lima, { pin: { x: 62, y: 40 }, distanceKm: 0.8 });

  expect(km(lima, at).distance).toBeCloseTo(0.8, 2);
});

test('keeps the direction of its spot on the drawn map: right is east, up is north', () => {
  const northEast = km(lima, alertLocation(lima, { pin: { x: 70, y: 30 }, distanceKm: 1 }));
  const southWest = km(lima, alertLocation(lima, { pin: { x: 30, y: 78 }, distanceKm: 1 }));

  expect(northEast.east).toBeGreaterThan(0);
  expect(northEast.north).toBeGreaterThan(0);
  expect(southWest.east).toBeLessThan(0);
  expect(southWest.north).toBeLessThan(0);
});

test('an alert at the centre of the drawn map is on the person', () => {
  expect(alertLocation(lima, { pin: { x: 50, y: 54 }, distanceKm: 0.1 })).toEqual(lima);
});
