import { Injectable, computed, inject, signal } from '@angular/core';
import { loadable } from '../../core/loadable.ts';
import { PetsRepository } from '../../data/pets/pets.repository.ts';
import type { Pet } from '../../domain/models.ts';

/** The signed-in person's pets, and which one the profile is showing. */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly repo = inject(PetsRepository);

  readonly pets = loadable(() => this.repo.mine());
  private readonly selectedId = signal<string | null>(null);

  /** The chosen pet, or the first one until the person picks. */
  readonly current = computed<Pet | undefined>(() => {
    const pets = this.pets.data() ?? [];
    return pets.find((p) => p.id === this.selectedId()) ?? pets[0];
  });

  select(id: string): void {
    this.selectedId.set(id);
  }
}
