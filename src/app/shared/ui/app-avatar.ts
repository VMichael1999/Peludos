import { Component, computed, input } from '@angular/core';
import { Text, View } from '@ng-native/components';

/** A pet or person shown as initials on a soft blue disc; the ring marks an active story. */
@Component({
  selector: 'app-avatar',
  imports: [Text, View],
  template: `
    <view class="ring" [attr.data-ring]="ring() || null" [style]="ringStyle()">
      <view class="disc" [style]="discStyle()">
        <text class="initials" [style]="initialsStyle()">{{ initials() }}</text>
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
    .disc {
      background-color: var(--color-primary-container);
      align-items: center;
      justify-content: center;
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
