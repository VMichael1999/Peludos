import { Injectable, computed, effect, inject } from '@angular/core';
import { ColorScheme } from '@ng-native/device';
import { Storage } from '@ng-native/expo/async-storage';
import { PALETTE, type Palette } from './palette.ts';

export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * The user's theme choice. "system" follows the device; "light" and "dark" force the whole app,
 * native chrome included, through `ColorScheme.set()`. Because that call changes what
 * `prefers-color-scheme` and `light-dark()` resolve to, the stylesheets need no class or switch of
 * their own: they follow this service without knowing it exists.
 */
@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly scheme = inject(ColorScheme);
  private readonly store = inject(Storage);

  /** What the user picked. Persisted, and read back once storage answers. */
  readonly preference = this.store.signal<ThemePreference>('theme-preference', 'system');

  /** What is actually showing: the choice, or the device's scheme when following it. */
  readonly effective = computed(() => this.scheme.current());
  readonly palette = computed<Palette>(() => PALETTE[this.effective()]);

  constructor() {
    // Applies the choice at startup (once the stored value arrives) and on every change.
    effect(() => {
      const preference = this.preference();
      this.scheme.set(preference === 'system' ? null : preference);
    });
  }

  choose(preference: ThemePreference): void {
    this.preference.set(preference);
  }
}
