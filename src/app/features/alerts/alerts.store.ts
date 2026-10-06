import { Injectable, computed, inject, signal } from '@angular/core';
import { loadable } from '../../core/loadable.ts';
import { AlertsRepository, type NewAlert } from '../../data/alerts/alerts.repository.ts';
import type { AlertStatus, LostAlert } from '../../domain/models.ts';

@Injectable({ providedIn: 'root' })
export class AlertsStore {
  private readonly repo = inject(AlertsRepository);

  readonly tab = signal<AlertStatus>('lost');
  readonly lost = loadable(() => this.repo.list('lost'));
  readonly found = loadable(() => this.repo.list('found'));

  /** The alert shown on the current tab. */
  readonly current = computed(() => (this.tab() === 'lost' ? this.lost : this.found));
  readonly lostNearby = computed(() => this.lost.data() ?? []);
  /** The closest lost pet, for the banner on Inicio and the dot on the tab bar. */
  readonly nearest = computed<LostAlert | undefined>(() =>
    [...this.lostNearby()].sort((a, b) => a.distanceKm - b.distanceKm)[0],
  );

  find(id: string): LostAlert | undefined {
    return [...(this.lost.data() ?? []), ...(this.found.data() ?? [])].find((a) => a.id === id);
  }

  async report(input: NewAlert): Promise<LostAlert> {
    const alert = await this.repo.report(input);
    await this.lost.reload();
    return alert;
  }

  async addSighting(alertId: string, where: string): Promise<void> {
    await this.repo.addSighting(alertId, where);
    await this.lost.reload();
  }
}
