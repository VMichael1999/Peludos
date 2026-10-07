import { Injectable, inject, signal } from '@angular/core';
import type { Species } from '../../domain/models.ts';
import { PetPhotosRepository } from './pet-photos.repository.ts';

/** How many photos of each species are fetched, once, to hand out as portraits and galleries. */
const POOL = 80;
/** Portraits are the first photos of the pool and galleries the rest, so a pet's portrait is never in its own gallery. */
const PORTRAITS = 20;

const hash = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * The face of each pet, the same on every screen: the story, the post, the profile and the alert of
 * "Canela" show one photo. Photos come from a pool fetched once per species; each pet name takes the
 * next unused portrait, so two pets do not look alike while the pool lasts, and a pet keeps its
 * portrait for as long as the app runs. With no photo source (tests, offline) every answer is
 * undefined and the screens keep their initials and placeholders.
 */
@Injectable({ providedIn: 'root' })
export class PetPortraits {
  private readonly source = inject(PetPhotosRepository, { optional: true });
  private readonly pools: Record<Species, ReturnType<typeof signal<readonly string[]>>> = { dog: signal([]), cat: signal([]) };
  private readonly asked = new Set<Species>();
  private readonly taken = new Map<string, number>();
  private readonly counts: Record<Species, number> = { dog: 0, cat: 0 };

  /** The portrait of a pet, or undefined until photos have arrived, or when there are none. Reads a signal, so a template updates when they do. */
  portrait(name: string, species: Species): string | undefined {
    const pool = this.pool(species);
    if (!pool.length) return undefined;
    const key = `${species}:${name}`;
    if (!this.taken.has(key)) this.taken.set(key, this.counts[species]++);
    const portraits = Math.min(PORTRAITS, pool.length);
    return pool[this.taken.get(key)! % portraits];
  }

  /**
   * `count` photos for a pet's profile, from the part of the pool no portrait uses, the same for the
   * same pet. `skip` starts that many photos later, so a second set does not repeat the first.
   */
  gallery(name: string, species: Species, count: number, skip = 0): string[] {
    const pool = this.pool(species);
    const rest = pool.slice(Math.min(PORTRAITS, pool.length));
    const from = rest.length ? (hash(name) + skip) % rest.length : 0;
    return Array.from({ length: Math.min(count, rest.length) }, (_, i) => rest[(from + i) % rest.length]);
  }

  private pool(species: Species): readonly string[] {
    if (!this.asked.has(species)) {
      this.asked.add(species);
      void this.source?.photos(species, POOL).then((urls) => this.pools[species].set(urls));
    }
    return this.pools[species]();
  }
}
