import { Injectable } from '@angular/core';
import type { HealthRecord } from '../../domain/models.ts';
import { HEALTH } from '../mock/seed.ts';
import { HealthRepository } from './health.repository.ts';

@Injectable()
export class MockHealthRepository extends HealthRepository {
  async forPet(petId: string): Promise<HealthRecord | undefined> {
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    return HEALTH[petId];
  }
}
