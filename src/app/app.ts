import { Component, inject } from '@angular/core';
import { SafeAreaProvider } from '@ng-native/components';
import { StatusBar } from '@ng-native/device';
import { NativeStackOutlet } from '@ng-native/router';
import { Theme } from './core/theme/theme.ts';

/**
 * The root: it holds the design tokens as CSS custom properties. They cascade down the whole node
 * tree, so every component reads `var(--color-…)` and never a literal. Colours use `light-dark()`,
 * which follows `ColorScheme` (the device, or the user's choice in Ajustes), so there is one block
 * of values and no duplicated dark theme. Sizes are in points, scaled 1.25x from the 320-wide
 * mockups in docs/pantallas.html so they read the same on a ~393-pt iPhone.
 */
@Component({
  selector: 'app-root',
  imports: [NativeStackOutlet, SafeAreaProvider],
  template: `
    <safe-area-provider>
      <native-stack-outlet />
    </safe-area-provider>
  `,
  styles: `
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_400Regular.ttf');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_500Medium.ttf');
      font-weight: 500;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_600SemiBold.ttf');
      font-weight: 600;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_700Bold.ttf');
      font-weight: 700;
    }
    @font-face {
      font-family: 'Plus Jakarta Sans';
      src: url('../../assets/fonts/PlusJakartaSans_800ExtraBold.ttf');
      font-weight: 800;
    }
    :host {
      flex: 1;
      font-family: 'Plus Jakarta Sans';

      --color-bg: light-dark(#f6f8fc, #0b1220);
      --color-surface: light-dark(#ffffff, #121c30);
      --color-surface-2: light-dark(#eef2fa, #1a2742);
      --color-primary: light-dark(#1f4fa3, #8db2f5);
      --color-on-primary: light-dark(#ffffff, #0b1220);
      --color-primary-container: light-dark(#dce6f8, #203a6b);
      --color-accent: light-dark(#f2a93b, #f5b650);
      --color-on-accent: #1a1204;
      --color-text: light-dark(#0e1626, #e9effb);
      --color-text-muted: light-dark(#5b6784, #9aa7c4);
      --color-border: light-dark(#d9e0ee, #263553);
      --color-danger: light-dark(#c93636, #ff7a7a);
      --color-success: light-dark(#177a4c, #4cc38a);
      --color-danger-container: color-mix(in srgb, var(--color-danger) 14%, var(--color-surface));
      --color-success-container: color-mix(in srgb, var(--color-success) 14%, var(--color-surface));
      --color-accent-container: color-mix(in srgb, var(--color-accent) 25%, var(--color-surface));

      --radius-sm: 10px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-pill: 999px;

      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-5: 20px;
      --space-6: 28px;
      --space-7: 36px;

      --text-xs: 13px;
      --text-sm: 15px;
      --text-md: 17px;
      --text-lg: 19px;
      --text-xl: 22px;
      --text-2xl: 26px;
      --text-3xl: 34px;

      --control-height: 54px;
      --tap-target: 48px;
    }
  `,
})
export class App {
  constructor() {
    inject(Theme);
    inject(StatusBar).set({ style: 'auto' });
  }
}
