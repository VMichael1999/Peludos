import { Injectable } from '@angular/core';
import { PetPhotosRepository } from './pet-photos.repository.ts';

/** No photos at all: every card keeps its placeholder. What the tests and a build without network use. */
@Injectable()
export class MockPetPhotosRepository extends PetPhotosRepository {
  async photos(): Promise<string[]> {
    return [];
  }
}
