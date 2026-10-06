import type { Species } from '../../domain/models.ts';
import { PetPhotosRepository } from './pet-photos.repository.ts';

/**
 * Several photo sources behind one port: each species is asked of the sources in order, and the
 * first that has photos for it answers. Dogs from one service and cats from another look, to the
 * rest of the app, like a single source. A source that has nothing for a species costs no request.
 */
export class ChainPetPhotosRepository extends PetPhotosRepository {
  constructor(private readonly sources: readonly PetPhotosRepository[]) {
    super();
  }

  async photos(species: Species, count: number): Promise<string[]> {
    for (const source of this.sources) {
      const urls = await source.photos(species, count);
      if (urls.length > 0) return urls;
    }
    return [];
  }
}
