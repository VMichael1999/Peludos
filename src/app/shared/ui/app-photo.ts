import { Component, input } from '@angular/core';
import { Image, Text, View } from '@ng-native/components';

/**
 * A photo box. With a `src` it shows that image, filling the box; the soft blue gradient underneath
 * is what shows while the image loads, and stays if it never does. Without a `src` it is the
 * gradient with its caption, the placeholder every screen was designed against.
 */
@Component({
  selector: 'app-photo',
  imports: [Image, Text, View],
  template: `
    <view class="photo" [attr.data-tone]="tone()">
      @if (src(); as src) {
        <image class="image" [src]="src" [alt]="alt() ?? ''" resizeMode="cover" />
      } @else if (caption(); as caption) {
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
    .image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
  /** The image to show, as a URL. */
  readonly src = input<string>();
  /** What the image shows, for screen readers. */
  readonly alt = input<string>();
  readonly tone = input<'blue' | 'border' | 'warm'>('blue');
}
