import type { AlertStatus, LostAlert } from '../../domain/models.ts';

export interface NewAlert {
  readonly petName: string;
  readonly breed: string;
  readonly traits: string;
  readonly lastSeenAt: string;
  readonly phone: string;
}

export abstract class AlertsRepository {
  abstract list(status: AlertStatus): Promise<LostAlert[]>;
  abstract byId(id: string): Promise<LostAlert | undefined>;
  abstract report(alert: NewAlert): Promise<LostAlert>;
  abstract addSighting(alertId: string, where: string): Promise<LostAlert | undefined>;
}
