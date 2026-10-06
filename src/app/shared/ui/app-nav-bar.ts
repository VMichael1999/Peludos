import { Component, inject, input } from '@angular/core';
import { Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { AppIcon } from './app-icon.ts';
import { AppIconButton } from './app-icon-button.ts';

/** The top bar of a pushed screen: back arrow, centred title, and room for one action on the right. */
@Component({
  selector: 'app-nav-bar',
  imports: [AppIcon, AppIconButton, Text, View],
  template: `
    <view class="bar">
      <app-icon-button label="Volver" (press)="nav.back()"><app-icon name="back" [size]="28" /></app-icon-button>
      <text class="title" numberOfLines="1">{{ title() }}</text>
      <view class="trailing"><ng-content /></view>
    </view>
  `,
  styles: `
    .bar {
      flex-direction: row;
      align-items: center;
      padding: 0 var(--space-2) var(--space-1);
    }
    .title {
      flex: 1;
      text-align: center;
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
    }
    .trailing {
      min-width: var(--tap-target);
      align-items: center;
    }
  `,
})
export class AppNavBar {
  protected readonly nav = inject(NativeNavigation);
  readonly title = input.required<string>();
}
