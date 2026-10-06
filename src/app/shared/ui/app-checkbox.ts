import { Component, input, model } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import { AppIcon } from './app-icon.ts';

@Component({
  selector: 'app-checkbox',
  imports: [AppIcon, Pressable, Text, View],
  template: `
    <pressable
      class="row"
      accessibilityRole="checkbox"
      [accessibilityLabel]="label()"
      [accessibilityState]="{ checked: checked() }"
      (press)="checked.set(!checked())"
    >
      <view class="box" [attr.data-checked]="checked() || null">
        @if (checked()) {
          <app-icon name="check" [size]="16" tone="onPrimary" [strokeWidth]="3" />
        }
      </view>
      <text class="label">{{ label() }}</text>
    </pressable>
  `,
  styles: `
    .row {
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
      min-height: var(--tap-target);
    }
    .box {
      width: 24px;
      height: 24px;
      border-radius: 7px;
      border-width: 2px;
      border-color: var(--color-border);
      align-items: center;
      justify-content: center;
    }
    .box[data-checked] {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
    .label {
      color: var(--color-text);
      font-size: var(--text-sm);
    }
  `,
})
export class AppCheckbox {
  readonly checked = model(false);
  readonly label = input.required<string>();
}
