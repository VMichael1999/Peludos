import { signal } from '@angular/core';
import { expect, test } from 'vitest';
import type { Place } from '../../domain/models.ts';
import { FallbackPlacesRepository } from './fallback-places.repository.ts';
import { PlacesUnavailableError } from './google-places.repository.ts';
import { MockPlacesRepository } from './mock-places.repository.ts';
import { type NearbyQuery, PlacesRepository } from './places.repository.ts';

const query: NearbyQuery = { kind: 'vet', openNow: false, radiusKm: 3 };

class FailingGoogle extends PlacesRepository {
  readonly notice = signal<string | null>(null).asReadonly();
  constructor(private readonly error: Error) {
    super();
  }
  async nearby(): Promise<Place[]> {
    throw this.error;
  }
  async byId(): Promise<Place | undefined> {
    return undefined;
  }
  async catalog() {
    return [];
  }
}

class WorkingGoogle extends FailingGoogle {
  override async nearby(): Promise<Place[]> {
    return [{ id: 'g1', name: 'Real Vet', kind: 'vet', tagline: '', distanceKm: 0.3, openLabel: '', open: true, rating: null, phone: '', pin: { x: 50, y: 50 } }];
  }
}

test('uses Google when it answers, with no notice', async () => {
  const repo = new FallbackPlacesRepository(new WorkingGoogle(new Error('unused')), new MockPlacesRepository());

  const places = await repo.nearby(query);

  expect(places.map((p) => p.id)).toEqual(['g1']);
  expect(repo.notice()).toBeNull();
});

test('falls back to samples and says Google could not answer', async () => {
  const repo = new FallbackPlacesRepository(new FailingGoogle(new PlacesUnavailableError('service')), new MockPlacesRepository());

  const places = await repo.nearby(query);

  expect(places.length).toBeGreaterThan(0);
  expect(places.every((p) => p.kind === 'vet')).toBe(true);
  expect(repo.notice()).toContain('Google Maps');
});

test('without a position it asks the person to turn location on', async () => {
  const repo = new FallbackPlacesRepository(new FailingGoogle(new PlacesUnavailableError('location')), new MockPlacesRepository());

  await repo.nearby(query);

  expect(repo.notice()).toContain('ubicación');
});

test('the notice clears once Google answers again', async () => {
  const google = new FailingGoogle(new PlacesUnavailableError('service'));
  const repo = new FallbackPlacesRepository(google, new MockPlacesRepository());
  await repo.nearby(query);
  expect(repo.notice()).not.toBeNull();

  Object.setPrototypeOf(google, WorkingGoogle.prototype);
  await repo.nearby(query);

  expect(repo.notice()).toBeNull();
});
