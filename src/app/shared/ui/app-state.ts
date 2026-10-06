import { Component, input, output } from '@angular/core';
import { Text, View } from '@ng-native/components';
import type { IconName } from '../../core/icons.ts';
import { AppButton, type ButtonVariant } from './app-button.ts';
import { AppIcon } from './app-icon.ts';

/** An empty or error state: what happened, in plain words, and what to do next. */
@Component({
  selector: 'app-state',
  imports: [AppButton, AppIcon, Text, View],
  template: `
    <view class="state">
      <view class="disc" [attr.data-bad]="bad() || null">
        <app-icon [name]="icon()" [size]="44" [tone]="bad() ? 'danger' : 'primary'" [strokeWidth]="1.6" />
      </view>
      <text class="title">{{ title() }}</text>
      <text class="message">{{ message() }}</text>
      @if (action(); as action) {
        <app-button [label]="action" [variant]="actionVariant()" (press)="act.emit()" />
      }
    </view>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .state {
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: 0 var(--space-7);
    }
    .disc {
      width: 104px;
      height: 104px;
      border-radius: 52px;
      background-color: var(--color-primary-container);
      align-items: center;
      justify-content: center;
    }
    .disc[data-bad] {
      background-color: var(--color-danger-container);
    }
    .title {
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
      text-align: center;
    }
    .message {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      text-align: center;
    }
  `,
})
export class AppState {
  readonly icon = input.required<IconName>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly action = input<string>();
  readonly actionVariant = input<ButtonVariant>('ghost');
  readonly bad = input(false);
  readonly act = output<void>();
}
