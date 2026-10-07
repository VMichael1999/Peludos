import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Location } from '@ng-native/expo/location';
import { firstValueFrom } from 'rxjs';
import { MAPS_API_KEY } from '../../core/config.ts';
import type { Place, PlaceKind, Product } from '../../domain/models.ts';
import { type Coordinates, toPlace } from './google-places.mapper.ts';
import { PlacesUnavailableError } from './google-places.repository.ts';
import { isRefusal, parseLegacy } from './google-places-legacy.mapper.ts';
import { type NearbyQuery, PlacesRepository } from './places.repository.ts';

const API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

/**
 * The same directory through the classic Places API, for a Google project that has that one
 * enabled and not the new one. Classic results carry no phone number, so `phone` stays empty.
 * Vets and pet shops are searched by place type; groomers have no type, so by keyword.
 */
@Injectable()
export class LegacyGooglePlacesRepository extends PlacesRepository {
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

  async catalog(_placeId: string): Promise<Product[]> {
    return [];
  }

  private async search(kind: PlaceKind, origin: Coordinates, radiusKm: number): Promise<Place[]> {
    const params = new URLSearchParams({
      location: `${origin.latitude},${origin.longitude}`,
      radius: String(Math.min(radiusKm * 1000, 50_000)),
      key: this.key,
    });
    if (kind === 'groomer') params.set('keyword', 'peluquería canina gatuna');
    else params.set('type', kind === 'vet' ? 'veterinary_care' : 'pet_store');

    let response: unknown;
    try {
      response = await firstValueFrom(this.http.get<unknown>(`${API}?${params}`));
    } catch (error) {
      throw new PlacesUnavailableError('service', error instanceof Error ? error.message : undefined);
    }
    if (isRefusal(response)) throw new PlacesUnavailableError('service', (response as { status: string }).status);
    return parseLegacy(response).flatMap((raw) => toPlace(raw, origin, radiusKm, kind, kind === 'groomer') ?? []);
  }
}
