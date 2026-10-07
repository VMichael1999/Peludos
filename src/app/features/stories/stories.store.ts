import { Injectable, signal } from '@angular/core';

/** Which stories the person has already watched: their ring turns grey, as on every app with stories. */
@Injectable({ providedIn: 'root' })
export class StoriesStore {
  private readonly watched = signal<ReadonlySet<string>>(new Set());

  seen(id: string): boolean {
    return this.watched().has(id);
  }

  markSeen(id: string): void {
    if (!this.watched().has(id)) this.watched.update((set) => new Set(set).add(id));
  }
}
