import type { HealthRecord } from '../../domain/models.ts';

export abstract class HealthRepository {
  abstract forPet(petId: string): Promise<HealthRecord | undefined>;
}
