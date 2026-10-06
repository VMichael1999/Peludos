import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Location } from '@ng-native/expo/location';
import { firstValueFrom } from 'rxjs';
import { MAPS_API_KEY } from '../../core/config.ts';
import type { Place, PlaceKind, Product } from '../../domain/models.ts';
import { type Coordinates, FIELD_MASK, type GooglePlace, toPlace } from './google-places.mapper.ts';
import { type NearbyQuery, PlacesRepository } from './places.repository.ts';

const API = 'https://places.googleapis.com/v1';

/** Why Google could not answer: no position for the person, or the service itself refused. */
export class PlacesUnavailableError extends Error {
  constructor(readonly reason: 'location' | 'service', detail?: string) {
    super(detail ?? reason);
  }
}

/**
 * The real directory: Google Places (New) around the device's position. Vets and pet shops come
 * from a nearby search by place type; groomers have no type of their own, so they come from a text
 * search. Results are ordered by distance, nearest first, as the port requires.
 */
@Injectable()
export class GooglePlacesRepository extends PlacesRepository {
  private readonly http = inject(HttpClient);
  private readonly location = inject(Location);
  private readonly key = inject(MAPS_API_KEY);
  private readonly seen = new Map<string, Place>();

  readonly notice = signal<string | null>(null).asReadonly();

  async nearby({ kind, openNow, radiusKm }: NearbyQuery): Promise<Place[]> {
    const here = await this.location.current('balanced');
    if (!here) throw new PlacesUnavailableError('location');
    const origin: Coordinates = { latitude: here.latitude, longitude: here.longitude };

    const kinds: PlaceKind[] = kind === 'all' ? ['vet', 'shop', 'groomer'] : [kind];
    const lists = await Promise.all(kinds.map((k) => this.search(k, origin, radiusKm)));

    const places = new Map<string, Place>();
    for (const place of lists.flat()) places.set(place.id, place);
    for (const place of places.values()) this.seen.set(place.id, place);

    return [...places.values()]
      .filter((p) => p.distanceKm <= radiusKm && (!openNow || p.open))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async byId(id: string): Promise<Place | undefined> {
    return this.seen.get(id);
  }

  /** Google has no product catalogue: affiliated shops will publish theirs in this app's own backend. */
  async catalog(_placeId: string): Promise<Product[]> {
    return [];
  }

  private async search(kind: PlaceKind, origin: Coordinates, radiusKm: number): Promise<Place[]> {
    const circle = { center: origin, radius: Math.min(radiusKm * 1000, 50_000) };
    const request =
      kind === 'groomer'
        ? this.post('places:searchText', { textQuery: 'peluquería canina y gatuna', locationBias: { circle }, maxResultCount: 20 })
        : this.post('places:searchNearby', {
            includedTypes: [kind === 'vet' ? 'veterinary_care' : 'pet_store'],
            maxResultCount: 20,
            rankPreference: 'DISTANCE',
            locationRestriction: { circle },
          });
    const { places = [] } = await request;
    return places.flatMap((raw) => toPlace(raw, origin, radiusKm, kind, kind === 'groomer') ?? []);
  }

  private async post(path: string, body: unknown): Promise<{ places?: GooglePlace[] }> {
    try {
      return await firstValueFrom(
        this.http.post<{ places?: GooglePlace[] }>(`${API}/${path}`, body, {
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': this.key, 'X-Goog-FieldMask': FIELD_MASK },
        }),
      );
    } catch (error) {
      throw new PlacesUnavailableError('service', error instanceof Error ? error.message : undefined);
    }
  }
}
