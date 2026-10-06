import { Component, input, output } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';

/** A round, icon-only button with a 48-point touch target and an optional count badge. */
@Component({
  selector: 'app-icon-button',
  imports: [Pressable, Text, View],
  template: `
    <pressable class="hit" accessibilityRole="button" [accessibilityLabel]="label()" (press)="press.emit()">
      <ng-content />
      @if (badge(); as badge) {
        <view class="badge"><text class="count">{{ badge }}</text></view>
      }
    </pressable>
  `,
  styles: `
    :host {
      flex: none;
    }
    .hit {
      width: var(--tap-target);
      height: var(--tap-target);
      border-radius: 24px;
      align-items: center;
      justify-content: center;
    }
    .hit:active {
      background-color: var(--color-surface-2);
    }
    .badge {
      position: absolute;
      top: 4px;
      right: 2px;
      min-width: 20px;
      height: 20px;
      padding: 0 5px;
      border-radius: 10px;
      background-color: var(--color-danger);
      align-items: center;
      justify-content: center;
    }
    .count {
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
    }
  `,
})
export class AppIconButton {
  readonly label = input.required<string>();
  readonly badge = input<string>();
  readonly press = output<void>();
}
