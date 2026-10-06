import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { loadable } from '../../core/loadable.ts';
import { PlacesRepository } from '../../data/places/places.repository.ts';
import type { PlaceKind } from '../../domain/models.ts';

export type PlaceFilter = PlaceKind | 'all';

/** The directory of nearby vets, pet shops and groomers: the filter, and the list it produces. */
@Injectable({ providedIn: 'root' })
export class PlacesStore {
  private readonly repo = inject(PlacesRepository);

  readonly kind = signal<PlaceFilter>('all');
  readonly openNow = signal(false);
  readonly radiusKm = signal(3);

  readonly results = loadable(() =>
    this.repo.nearby({ kind: this.kind(), openNow: this.openNow(), radiusKm: this.radiusKm() }),
  );

  readonly title = computed(() => {
    switch (this.kind()) {
      case 'vet': return 'Veterinarias cerca';
      case 'shop': return 'Pet shops cerca';
      case 'groomer': return 'Peluquerías cerca';
      default: return 'Tiendas y veterinarias';
    }
  });

  constructor() {
    // Choosing "Veterinarias" or "Pet shops" reloads the list, nearest first.
    let first = true;
    effect(() => {
      this.kind();
      this.openNow();
      this.radiusKm();
      if (first) return void (first = false);
      untracked(() => void this.results.reload());
    });
  }
}
