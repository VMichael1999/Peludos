import { Component, computed, inject, input } from '@angular/core';
import { Image, Text, View } from '@ng-native/components';
import { PetPortraits } from '../../data/photos/pet-portraits.ts';
import type { Species } from '../../domain/models.ts';

/**
 * A pet or person shown as initials on a soft blue disc; the ring marks an active story. Given a
 * `species`, it is a pet and shows its portrait over the initials, which stay while the photo loads
 * and when there is none.
 */
@Component({
  selector: 'app-avatar',
  imports: [Image, Text, View],
  template: `
    <view class="ring" [attr.data-ring]="ring() || null" [attr.data-seen]="seen() || null" [style]="ringStyle()">
      <view class="disc" [style]="discStyle()">
        <text class="initials" [style]="initialsStyle()">{{ initials() }}</text>
        @if (portrait(); as src) {
          <image class="portrait" [src]="src" [alt]="name()" resizeMode="cover" />
        }
      </view>
    </view>
  `,
  styles: `
    :host {
      flex: none;
    }
    .ring {
      align-items: center;
      justify-content: center;
    }
    .ring[data-ring] {
      border-width: 2.5px;
      border-color: var(--color-accent);
    }
    .ring[data-seen] {
      border-color: var(--color-border);
    }
    .disc {
      overflow: hidden;
      background-color: var(--color-primary-container);
      align-items: center;
      justify-content: center;
    }
    .portrait {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .initials {
      color: var(--color-primary);
      font-weight: 800;
    }
  `,
})
export class AppAvatar {
  readonly name = input.required<string>();
  readonly size = input(48);
  readonly ring = input(false);
  /** A watched story: its ring is grey instead of gold. */
  readonly seen = input(false);
  /** Set for a pet: its portrait is shown. */
  readonly species = input<Species | null>(null);

  private readonly portraits = inject(PetPortraits);
  protected readonly portrait = computed(() => {
    const species = this.species();
    return species ? this.portraits.portrait(this.name(), species) : undefined;
  });

  protected readonly initials = computed(() => this.name().trim().charAt(0).toUpperCase());
  protected readonly ringStyle = computed(() => {
    const outer = this.size() + (this.ring() ? 10 : 0);
    return { width: outer, height: outer, borderRadius: outer / 2 };
  });
  protected readonly discStyle = computed(() => ({
    width: this.size(),
    height: this.size(),
    borderRadius: this.size() / 2,
  }));
  protected readonly initialsStyle = computed(() => ({ fontSize: Math.round(this.size() * 0.36) }));
}
