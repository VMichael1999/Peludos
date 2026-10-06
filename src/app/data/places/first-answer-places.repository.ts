import { signal } from '@angular/core';
import type { Place, Product } from '../../domain/models.ts';
import { type NearbyQuery, PlacesRepository } from './places.repository.ts';

/**
 * Several real sources of the same places: they are tried in order and the first that answers wins.
 * If none does, the last one's error goes up, for a fallback to turn into samples and a notice.
 * It is how a project with only the older Google API enabled still gets real places.
 */
export class FirstAnswerPlacesRepository extends PlacesRepository {
  readonly notice = signal<string | null>(null).asReadonly();
  /** The source that last answered, so a place found by it is looked up in it. */
  private lastGood: PlacesRepository | null = null;

  constructor(private readonly sources: readonly PlacesRepository[]) {
    super();
  }

  async nearby(query: NearbyQuery): Promise<Place[]> {
    let failure: unknown = new Error('no places source');
    for (const source of this.sources) {
      try {
        const places = await source.nearby(query);
        this.lastGood = source;
        return places;
      } catch (error) {
        failure = error;
      }
    }
    throw failure;
  }

  async byId(id: string): Promise<Place | undefined> {
    return this.lastGood?.byId(id);
  }

  async catalog(placeId: string): Promise<Product[]> {
    return this.lastGood?.catalog(placeId) ?? [];
  }
}
