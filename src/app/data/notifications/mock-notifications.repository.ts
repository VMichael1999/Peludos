import { Injectable } from '@angular/core';
import type { AppNotification } from '../../domain/models.ts';
import { NOTIFICATIONS } from '../mock/seed.ts';
import { NotificationsRepository } from './notifications.repository.ts';

@Injectable()
export class MockNotificationsRepository extends NotificationsRepository {
  async list(): Promise<AppNotification[]> {
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    return [...NOTIFICATIONS];
  }
}
