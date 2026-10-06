import { Component, computed, input } from '@angular/core';
import { View } from '@ng-native/components';

/** A loading placeholder shaped like the content it stands in for (never a lone spinner). */
@Component({
  selector: 'app-skeleton',
  imports: [View],
  template: `<view class="bone" [style]="boneStyle()"></view>`,
  styles: `
    .bone {
      background-color: var(--color-surface-2);
      animation: pulse 1.2s ease-in-out infinite alternate;
    }
    @keyframes pulse {
      from {
        opacity: 1;
      }
      to {
        opacity: 0.55;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .bone {
        animation: none;
      }
    }
  `,
})
export class AppSkeleton {
  readonly width = input<number | string>('100%');
  readonly height = input(14);
  readonly radius = input(8);

  protected readonly boneStyle = computed(() => ({
    width: this.width(),
    height: this.height(),
    borderRadius: this.radius(),
  }));
}
