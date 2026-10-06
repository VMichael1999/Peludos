import type { Pet } from '../../domain/models.ts';

export abstract class PetsRepository {
  abstract mine(): Promise<Pet[]>;
}
