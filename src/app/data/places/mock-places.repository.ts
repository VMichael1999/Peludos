import { Injectable, signal } from '@angular/core';
import type { Place, Product } from '../../domain/models.ts';
import { PLACES, PRODUCTS } from '../mock/seed.ts';
import { type NearbyQuery, PlacesRepository } from './places.repository.ts';

const wait = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

@Injectable()
export class MockPlacesRepository extends PlacesRepository {
  readonly notice = signal<string | null>('Mostrando lugares de ejemplo.').asReadonly();

  async nearby({ kind, openNow, radiusKm }: NearbyQuery): Promise<Place[]> {
    await wait();
    return PLACES.filter((p) => (kind === 'all' || p.kind === kind) && p.distanceKm <= radiusKm && (!openNow || p.open))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async byId(id: string): Promise<Place | undefined> {
    await wait(250);
    return PLACES.find((p) => p.id === id);
  }

  /** The mock has one catalogue for every shop; a real adapter would filter by `_placeId`. */
  async catalog(_placeId: string): Promise<Product[]> {
    await wait(300);
    return [...PRODUCTS];
  }
}
