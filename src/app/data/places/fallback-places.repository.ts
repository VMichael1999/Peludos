import { signal } from '@angular/core';
import type { Place, Product } from '../../domain/models.ts';
import { PlacesUnavailableError } from './google-places.repository.ts';
import { type NearbyQuery, PlacesRepository } from './places.repository.ts';

/**
 * Real places when Google answers, sample places when it cannot, and a notice saying which. The app
 * stays usable while the key or the API is not set up, and the person is never shown a made-up
 * place as if it were real.
 */
export class FallbackPlacesRepository extends PlacesRepository {
  private readonly message = signal<string | null>(null);
  readonly notice = this.message.asReadonly();

  constructor(
    private readonly primary: PlacesRepository,
    private readonly sample: PlacesRepository,
  ) {
    super();
  }

  async nearby(query: NearbyQuery): Promise<Place[]> {
    try {
      const places = await this.primary.nearby(query);
      this.message.set(null);
      return places;
    } catch (error) {
      this.message.set(
        error instanceof PlacesUnavailableError && error.reason === 'location'
          ? 'Activa tu ubicación para ver lugares reales cerca de ti. Mientras, mostramos ejemplos.'
          : 'No pudimos consultar Google Maps. Mostramos lugares de ejemplo.',
      );
      return this.sample.nearby(query);
    }
  }

  /** A sample id is short ("l1"); anything else came from Google. */
  async byId(id: string): Promise<Place | undefined> {
    return (await this.sample.byId(id)) ?? this.primary.byId(id);
  }

  async catalog(placeId: string): Promise<Product[]> {
    return (await this.sample.byId(placeId)) ? this.sample.catalog(placeId) : this.primary.catalog(placeId);
  }
}
