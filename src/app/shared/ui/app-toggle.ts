import { Component, input, model } from '@angular/core';
import { Pressable, View } from '@ng-native/components';

/** An on/off switch drawn to the brand: a pill with a round thumb. */
@Component({
  selector: 'app-toggle',
  imports: [Pressable, View],
  template: `
    <pressable
      class="track"
      accessibilityRole="switch"
      [accessibilityLabel]="label()"
      [accessibilityState]="{ checked: checked() }"
      [attr.data-on]="checked() || null"
      (press)="checked.set(!checked())"
    >
      <view class="thumb" [attr.data-on]="checked() || null"></view>
    </pressable>
  `,
  styles: `
    :host {
      flex: none;
    }
    .track {
      width: 52px;
      height: 32px;
      border-radius: 16px;
      background-color: var(--color-border);
      justify-content: center;
      padding: 3px;
    }
    .track[data-on] {
      background-color: var(--color-primary);
    }
    .thumb {
      width: 26px;
      height: 26px;
      border-radius: 13px;
      background-color: #ffffff;
    }
    .thumb[data-on] {
      align-self: flex-end;
      background-color: var(--color-on-primary);
    }
  `,
})
export class AppToggle {
  readonly checked = model(false);
  readonly label = input.required<string>();
}
