import { signal } from '@angular/core';
import { expect, test, vi } from 'vitest';
import type { Place } from '../../domain/models.ts';
import { FirstAnswerPlacesRepository } from './first-answer-places.repository.ts';
import { type NearbyQuery, PlacesRepository } from './places.repository.ts';

const query: NearbyQuery = { kind: 'vet', openNow: false, radiusKm: 3 };
const place = (id: string): Place => ({ id, name: id, kind: 'vet', tagline: '', distanceKm: 1, openLabel: '', open: true, rating: null, phone: '', pin: { x: 1, y: 1 } });

class Source extends PlacesRepository {
  readonly notice = signal<string | null>(null).asReadonly();
  readonly nearby = vi.fn(async (_q: NearbyQuery): Promise<Place[]> => []);
  readonly byId = vi.fn(async (_id: string): Promise<Place | undefined> => undefined);
  async catalog() {
    return [];
  }
}

test('the first source that answers wins and the rest are not asked', async () => {
  const a = new Source();
  const b = new Source();
  a.nearby.mockResolvedValue([place('a')]);

  const places = await new FirstAnswerPlacesRepository([a, b]).nearby(query);

  expect(places.map((p) => p.id)).toEqual(['a']);
  expect(b.nearby).not.toHaveBeenCalled();
});

test('a source that fails hands over to the next', async () => {
  const a = new Source();
  const b = new Source();
  a.nearby.mockRejectedValue(new Error('403'));
  b.nearby.mockResolvedValue([place('b')]);

  expect((await new FirstAnswerPlacesRepository([a, b]).nearby(query)).map((p) => p.id)).toEqual(['b']);
});

test('an empty answer is an answer: no results is not a failure', async () => {
  const a = new Source();
  const b = new Source();

  expect(await new FirstAnswerPlacesRepository([a, b]).nearby(query)).toEqual([]);
  expect(b.nearby).not.toHaveBeenCalled();
});

test('when every source fails the last error goes up', async () => {
  const a = new Source();
  const b = new Source();
  a.nearby.mockRejectedValue(new Error('first'));
  b.nearby.mockRejectedValue(new Error('last'));

  await expect(new FirstAnswerPlacesRepository([a, b]).nearby(query)).rejects.toThrow('last');
});

test('a place is looked up in the source that found it', async () => {
  const a = new Source();
  const b = new Source();
  a.nearby.mockRejectedValue(new Error('x'));
  b.byId.mockResolvedValue(place('b1'));
  const repo = new FirstAnswerPlacesRepository([a, b]);
  await repo.nearby(query);

  expect((await repo.byId('b1'))?.id).toBe('b1');
  expect(a.byId).not.toHaveBeenCalled();
});
