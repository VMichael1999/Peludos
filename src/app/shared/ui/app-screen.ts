import { Component, input } from '@angular/core';
import { SafeAreaView } from '@ng-native/components';

/** The page background plus the safe-area insets: every screen sits inside one. */
@Component({
  selector: 'app-screen',
  imports: [SafeAreaView],
  template: `<safe-area-view class="screen" [edges]="edges()"><ng-content /></safe-area-view>`,
  styles: `
    :host {
      flex: 1;
      background-color: var(--color-bg);
    }
    .screen {
      flex: 1;
    }
  `,
})
export class AppScreen {
  readonly edges = input<('top' | 'bottom')[]>(['top', 'bottom']);
}
