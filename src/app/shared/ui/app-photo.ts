import { Component, input } from '@angular/core';
import { Text, View } from '@ng-native/components';

/**
 * A stand-in for a photo until real images arrive: a soft blue gradient with a caption. Real photos
 * will replace the gradient with an `<image>` in the same box, so nothing else needs to change.
 */
@Component({
  selector: 'app-photo',
  imports: [Text, View],
  template: `
    <view class="photo" [attr.data-tone]="tone()">
      @if (caption(); as caption) {
        <text class="caption">{{ caption }}</text>
      }
    </view>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .photo {
      flex: 1;
      align-items: center;
      justify-content: center;
      background-image: linear-gradient(135deg, var(--color-primary-container), var(--color-surface-2));
    }
    .photo[data-tone='border'] {
      background-image: linear-gradient(135deg, var(--color-surface-2), var(--color-border));
    }
    .photo[data-tone='warm'] {
      background-image: linear-gradient(135deg, var(--color-accent-container), var(--color-surface-2));
    }
    .caption {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-muted);
    }
  `,
})
export class AppPhoto {
  readonly caption = input<string>();
  readonly tone = input<'blue' | 'border' | 'warm'>('blue');
}
