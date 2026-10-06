import { Injectable } from '@angular/core';
import type { AlertStatus, LostAlert } from '../../domain/models.ts';
import { ALERTS } from '../mock/seed.ts';
import { AlertsRepository, type NewAlert } from './alerts.repository.ts';

const wait = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

@Injectable()
export class MockAlertsRepository extends AlertsRepository {
  private alerts: LostAlert[] = [...ALERTS];

  async list(status: AlertStatus): Promise<LostAlert[]> {
    await wait();
    return this.alerts.filter((a) => a.status === status).sort((a, b) => a.minutesAgo - b.minutesAgo);
  }

  async byId(id: string): Promise<LostAlert | undefined> {
    await wait(250);
    return this.alerts.find((a) => a.id === id);
  }

  async report(input: NewAlert): Promise<LostAlert> {
    await wait(600);
    const alert: LostAlert = {
      id: 'a' + (this.alerts.length + 1), ...input, minutesAgo: 0, status: 'lost',
      distanceKm: 0.1, sightings: [], pin: { x: 50, y: 52 },
    };
    this.alerts = [alert, ...this.alerts];
    return alert;
  }

  async addSighting(alertId: string, where: string): Promise<LostAlert | undefined> {
    await wait(350);
    this.alerts = this.alerts.map((a) =>
      a.id === alertId
        ? { ...a, sightings: [{ id: 's' + (a.sightings.length + 1), by: 'Lucía', where, minutesAgo: 0 }, ...a.sightings] }
        : a,
    );
    return this.alerts.find((a) => a.id === alertId);
  }
}
