import { expect, test } from 'vitest';
import { MockPlacesRepository } from './mock-places.repository.ts';

const repo = new MockPlacesRepository();

test('answers nearest first', async () => {
  const places = await repo.nearby({ kind: 'all', openNow: false, radiusKm: 10 });
  const distances = places.map((p) => p.distanceKm);
  expect(distances).toEqual([...distances].sort((a, b) => a - b));
});

test('"Veterinarias" returns only vets, inside the radius', async () => {
  const places = await repo.nearby({ kind: 'vet', openNow: false, radiusKm: 3 });
  expect(places.length).toBeGreaterThan(0);
  expect(places.every((p) => p.kind === 'vet' && p.distanceKm <= 3)).toBe(true);
});

test('"Abierto ahora" leaves out what is closed', async () => {
  const places = await repo.nearby({ kind: 'all', openNow: true, radiusKm: 10 });
  expect(places.some((p) => !p.open)).toBe(false);
});

test('a shop has a catalogue and an unknown id has no place', async () => {
  expect((await repo.byId('l1'))?.kind).toBe('shop');
  expect(await repo.byId('nope')).toBeUndefined();
  expect((await repo.catalog('l1')).length).toBeGreaterThan(0);
});
