import { Injectable } from '@angular/core';
import type { Pet } from '../../domain/models.ts';
import { MY_PETS } from '../mock/seed.ts';
import { PetsRepository } from './pets.repository.ts';

@Injectable()
export class MockPetsRepository extends PetsRepository {
  async mine(): Promise<Pet[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    return [...MY_PETS];
  }
}
