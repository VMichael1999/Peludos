import { Component, input, output } from '@angular/core';
import { Pressable, SafeAreaView, View } from '@ng-native/components';
import type { IconName } from '../../core/icons.ts';
import type { Species } from '../../domain/models.ts';
import { AppAvatar } from './app-avatar.ts';
import { AppIcon } from './app-icon.ts';

export type TabId = 'home' | 'reels' | 'search' | 'alerts' | 'me';

interface TabSpec {
  readonly id: TabId;
  readonly label: string;
  readonly icon: IconName | null;
}

const TABS: readonly TabSpec[] = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'reels', label: 'Reels', icon: 'reels' },
  { id: 'search', label: 'Explorar', icon: 'search' },
  { id: 'alerts', label: 'Alertas de mascotas perdidas', icon: 'alert' },
  { id: 'me', label: 'Mi perfil', icon: null },
];

/**
 * The bottom bar: five icons, no text. The active one is told apart by shape (heavier stroke, a
 * soft fill and a dot beneath), not by colour alone. Alerts shows a red dot when a lost pet is near.
 * It is drawn by the app, not by the system tab bar, because a system tab item cannot hold the
 * profile photo or this icon set.
 */
@Component({
  selector: 'app-tab-bar',
  imports: [AppAvatar, AppIcon, Pressable, SafeAreaView, View],
  template: `
    <view class="bar" [attr.data-over]="over() || null">
      <safe-area-view [edges]="['bottom']">
        <view class="row">
          @for (tab of tabs; track tab.id) {
            <pressable
              class="tab"
              accessibilityRole="button"
              [accessibilityLabel]="tab.label"
              [accessibilityState]="{ selected: active() === tab.id }"
              (press)="select.emit(tab.id)"
            >
              <view class="icon" [attr.data-active]="active() === tab.id || null">
                @if (tab.icon; as icon) {
                  <app-icon
                    [name]="icon"
                    [size]="32"
                    [tone]="toneOf(tab.id)"
                    [strokeWidth]="active() === tab.id ? 2.4 : 1.8"
                    [fillTone]="active() === tab.id && !over() ? 'primaryContainer' : null"
                  />
                } @else {
                  <view class="me" [attr.data-active]="active() === tab.id || null">
                    <app-avatar [name]="name()" [species]="species()" [size]="30" />
                  </view>
                }
              </view>
              @if (active() === tab.id) {
                <view class="dot"></view>
              }
              @if (tab.id === 'alerts' && alertDot()) {
                <view class="alert-dot"></view>
              }
            </pressable>
          }
        </view>
      </safe-area-view>
    </view>
  `,
  styles: `
    .bar {
      background-color: var(--color-surface);
      border-top-width: 1px;
      border-top-color: var(--color-border);
    }
    .bar[data-over] {
      background-color: #0a0f1a;
      border-top-color: rgba(255, 255, 255, 0.12);
    }
    .row {
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      padding: var(--space-2) var(--space-1) 0;
    }
    .tab {
      width: 64px;
      height: 52px;
      align-items: center;
      justify-content: center;
    }
    .icon {
      opacity: 0.9;
    }
    .dot {
      position: absolute;
      bottom: 1px;
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background-color: var(--color-primary);
    }
    .bar[data-over] .dot {
      background-color: #ffffff;
    }
    .alert-dot {
      position: absolute;
      top: 8px;
      right: 14px;
      width: 11px;
      height: 11px;
      border-radius: 6px;
      border-width: 2px;
      border-color: var(--color-surface);
      background-color: var(--color-danger);
    }
    .me {
      width: 34px;
      height: 34px;
      border-radius: 17px;
      align-items: center;
      justify-content: center;
      background-color: var(--color-primary-container);
      border-width: 2px;
      border-color: transparent;
    }
    .me[data-active] {
      border-color: var(--color-primary);
    }
  `,
})
export class AppTabBar {
  readonly active = input.required<TabId>();
  readonly over = input(false);
  readonly alertDot = input(false);
  /** The profile's pet: its portrait is the profile tab's icon, its initial until the photo arrives. */
  readonly name = input('L');
  readonly species = input<Species | null>(null);
  readonly select = output<TabId>();

  protected readonly tabs = TABS;

  protected toneOf(id: TabId) {
    if (this.over()) return 'white' as const;
    return this.active() === id ? ('primary' as const) : ('muted' as const);
  }
}
