import { expect, test } from 'vitest';
import type { Place } from '../../domain/models.ts';
import { cameraFor } from './places-camera.ts';

const place = (id: string, latitude?: number, longitude?: number): Place => ({
  id, name: id, kind: 'vet', tagline: '', distanceKm: 0, openLabel: '', open: true, rating: null, phone: '',
  pin: { x: 50, y: 50 }, location: latitude === undefined ? undefined : { latitude, longitude: longitude! },
});

test('centres on the middle of the places', () => {
  const camera = cameraFor([place('a', -12.04, -77.04), place('b', -12.06, -77.02)])!;

  expect(camera.coordinates.latitude).toBeCloseTo(-12.05, 5);
  expect(camera.coordinates.longitude).toBeCloseTo(-77.03, 5);
});

test('zooms out as the places spread apart', () => {
  const close = cameraFor([place('a', -12.04, -77.04), place('b', -12.041, -77.041)])!;
  const far = cameraFor([place('a', -12.0, -77.0), place('b', -12.1, -77.1)])!;

  expect(far.zoom).toBeLessThan(close.zoom);
});

test('never zooms past street level, even for one place', () => {
  expect(cameraFor([place('a', -12.04, -77.04)])!.zoom).toBeLessThanOrEqual(17);
});

test('has no camera when no place has coordinates', () => {
  expect(cameraFor([place('a')])).toBeNull();
  expect(cameraFor([])).toBeNull();
});
