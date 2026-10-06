import { Component, computed, inject } from '@angular/core';
import { ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { loadable } from '../../core/loadable.ts';
import { NotificationsRepository } from '../../data/notifications/notifications.repository.ts';
import type { AppNotification, NotificationKind } from '../../domain/models.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { NotificationRow } from './notification-row.ts';

/** Lost-pet alerts and health reminders come first: they are the ones that cannot wait. */
const URGENCY: Record<NotificationKind, number> = { alert: 0, health: 1, like: 2, follow: 2, comment: 2 };

@Component({
  selector: 'app-notifications-page',
  imports: [AppNavBar, AppScreen, AppSkeleton, AppState, NotificationRow, ScrollView, Text, View],
  template: `
    <app-screen>
      <app-nav-bar title="Notificaciones" />
      @switch (items.status()) {
        @case ('loading') {
          <view class="skeletons">
            @for (n of [1, 2, 3, 4]; track n) {
              <view class="skeleton-row">
                <app-skeleton [width]="40" [height]="40" [radius]="20" />
                <view class="grow">
                  <app-skeleton width="85%" [height]="13" />
                  <app-skeleton width="30%" [height]="11" />
                </view>
              </view>
            }
          </view>
        }
        @case ('error') {
          <app-state icon="wifiOff" title="No pudimos cargar tus avisos" message="Revisa tu conexión e inténtalo de nuevo." action="Reintentar" actionVariant="primary" [bad]="true" (act)="items.reload()" />
        }
        @case ('empty') {
          <app-state icon="bell" title="Todo al día" message="Cuando pase algo con tus mascotas o tus publicaciones, te lo contamos aquí." />
        }
        @default {
          <scroll-view class="fill" [contentContainerStyle]="{ paddingBottom: 24 }">
            @if (fresh().length) {
              <text class="section">Nuevas</text>
              @for (n of fresh(); track n.id) {
                <app-notification-row [item]="n" (open)="go($event)" />
              }
            }
            @if (earlier().length) {
              <text class="section">Anteriores</text>
              @for (n of earlier(); track n.id) {
                <app-notification-row [item]="n" (open)="go($event)" />
              }
            }
          </scroll-view>
        }
      }
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    .section {
      padding: var(--space-3) var(--space-4) var(--space-1);
      font-size: var(--text-sm);
      font-weight: 800;
      color: var(--color-text-muted);
    }
    .skeletons {
      gap: var(--space-4);
      padding: var(--space-4);
    }
    .skeleton-row {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
    }
    .grow {
      flex: 1;
      gap: var(--space-2);
    }
  `,
})
export class NotificationsPage {
  private readonly nav = inject(NativeNavigation);
  private readonly repo = inject(NotificationsRepository);

  protected readonly items = loadable(() => this.repo.list());
  private readonly all = computed(() => this.items.data() ?? []);
  protected readonly fresh = computed(() => this.byUrgency(this.all().filter((n) => n.unread)));
  protected readonly earlier = computed(() => this.byUrgency(this.all().filter((n) => !n.unread)));

  protected go(item: AppNotification): void {
    if (item.target) void this.nav.push(item.target);
  }

  private byUrgency(list: readonly AppNotification[]): AppNotification[] {
    return [...list].sort((a, b) => URGENCY[a.kind] - URGENCY[b.kind] || a.minutesAgo - b.minutesAgo);
  }
}
