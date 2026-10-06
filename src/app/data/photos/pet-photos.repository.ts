import type { Species } from '../../domain/models.ts';

/**
 * Where pet photos come from. Photos are decoration, never data the app depends on: an adapter that
 * cannot get any answers with an empty list, and the screens show their placeholders instead.
 */
export abstract class PetPhotosRepository {
  /** Up to `count` photo URLs of the given species, in no particular order. */
  abstract photos(species: Species, count: number): Promise<string[]>;
}
