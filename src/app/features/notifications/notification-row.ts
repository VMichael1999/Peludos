import { Component, computed, input, output } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import type { IconName } from '../../core/icons.ts';
import { ago } from '../../domain/format.ts';
import type { AppNotification, NotificationKind } from '../../domain/models.ts';
import { AppIcon, type Tone } from '../../shared/ui/app-icon.ts';

const ICON: Record<NotificationKind, IconName> = {
  alert: 'alert', health: 'shield', like: 'heart', follow: 'paw', comment: 'chat',
};
const TONE: Record<NotificationKind, Tone> = {
  alert: 'danger', health: 'success', like: 'primary', follow: 'primary', comment: 'primary',
};

/** One notification: a round icon, what happened with the who in bold, and how long ago. */
@Component({
  selector: 'app-notification-row',
  imports: [AppIcon, Pressable, Text, View],
  template: `
    <pressable
      class="row"
      accessibilityRole="button"
      [accessibilityLabel]="item().who + ' ' + item().text + ', ' + when()"
      [attr.data-new]="item().unread || null"
      (press)="open.emit(item())"
    >
      <view class="icon" [attr.data-kind]="item().kind">
        <app-icon [name]="icon()" [size]="22" [tone]="tone()" />
      </view>
      <view class="body">
        <text class="text"><text class="who">{{ item().who }}</text> {{ item().text }}</text>
        <text class="when">{{ when() }}</text>
      </view>
    </pressable>
  `,
  styles: `
    .row {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
    }
    .row[data-new] {
      background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
    }
    .icon {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      align-items: center;
      justify-content: center;
      background-color: var(--color-primary-container);
    }
    .icon[data-kind='alert'] {
      background-color: var(--color-danger-container);
    }
    .icon[data-kind='health'] {
      background-color: var(--color-success-container);
    }
    .body {
      flex: 1;
      gap: 2px;
    }
    .text {
      font-size: var(--text-sm);
      color: var(--color-text);
    }
    .who {
      font-weight: 800;
    }
    .when {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
  `,
})
export class NotificationRow {
  readonly item = input.required<AppNotification>();
  readonly open = output<AppNotification>();

  protected readonly icon = computed(() => ICON[this.item().kind]);
  protected readonly tone = computed(() => TONE[this.item().kind]);
  protected readonly when = computed(() => ago(this.item().minutesAgo));
}
