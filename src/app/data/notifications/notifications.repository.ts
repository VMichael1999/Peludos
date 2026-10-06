import type { AppNotification } from '../../domain/models.ts';

export abstract class NotificationsRepository {
  abstract list(): Promise<AppNotification[]>;
}
