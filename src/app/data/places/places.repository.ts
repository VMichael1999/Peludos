import type { Signal } from '@angular/core';
import type { Place, PlaceKind, Product } from '../../domain/models.ts';

export interface NearbyQuery {
  readonly kind: PlaceKind | 'all';
  readonly openNow: boolean;
  readonly radiusKm: number;
}

/**
 * Where the nearby vets and pet shops come from. The mock serves sample data; the real adapter will
 * call Google Places with the device's location. It must answer ordered by distance, nearest first.
 */
export abstract class PlacesRepository {
  /** Something the screen should tell the person, such as "these are sample places"; null when all is well. */
  abstract readonly notice: Signal<string | null>;
  abstract nearby(query: NearbyQuery): Promise<Place[]>;
  abstract byId(id: string): Promise<Place | undefined>;
  abstract catalog(placeId: string): Promise<Product[]>;
}
