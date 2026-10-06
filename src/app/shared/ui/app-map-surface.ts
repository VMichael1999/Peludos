import { Component, computed, input } from '@angular/core';
import { Text, View } from '@ng-native/components';
import type { IconName } from '../../core/icons.ts';
import { AppIcon, type Tone } from './app-icon.ts';

export type PinKind = 'lost' | 'found' | 'sighting' | 'vet' | 'shop' | 'groomer';

export interface MapPin {
  readonly id: string;
  /** Position as a percentage of the map's width and height. */
  readonly x: number;
  readonly y: number;
  readonly kind: PinKind;
  readonly label?: string;
}

const PIN_ICON: Record<PinKind, IconName> = {
  lost: 'alert', found: 'alert', sighting: 'eye', vet: 'pulse', shop: 'bag', groomer: 'paw',
};
const PIN_FILL: Record<PinKind, Tone> = {
  lost: 'danger', found: 'success', sighting: 'accent', vet: 'primary', shop: 'primary', groomer: 'primary',
};

/**
 * A drawn map: streets, a park, the user's position and pins. It is a stand-in for the real map
 * (Apple Maps on iOS, Google Maps on Android, through `expo-maps`), which needs a native rebuild and
 * cannot run in Expo Go. Screens depend on these inputs only, so swapping the real map in later
 * changes this one component.
 */
@Component({
  selector: 'app-map-surface',
  imports: [AppIcon, Text, View],
  template: `
    <view class="map" [style]="mapStyle()">
      <view class="park"></view>
      <view class="road road-h1"></view>
      <view class="road road-h2"></view>
      <view class="road road-v1"></view>
      <view class="road road-v2"></view>

      @if (radius(); as diameter) {
        <view class="radius" [style]="radiusStyle(diameter)"></view>
      }
      @if (me(); as me) {
        <view class="halo" [style]="at(me.x, me.y, 44, 44, 22)"></view>
        <view class="me" [style]="at(me.x, me.y, 22, 22, 11)"></view>
      }
      @for (pin of pins(); track pin.id) {
        <view class="pin" [style]="at(pin.x, pin.y, 100, 40, 40)">
          <app-icon [name]="iconOf(pin.kind)" [size]="40" tone="white" [fillTone]="fillOf(pin.kind)" [strokeWidth]="1.4" />
          @if (pin.label; as label) {
            <view class="label"><text class="label-text">{{ label }}</text></view>
          }
        </view>
      }
    </view>
  `,
  styles: `
    .map {
      overflow: hidden;
      background-color: var(--color-surface-2);
    }
    .park {
      position: absolute;
      left: 4%;
      top: 10%;
      width: 34%;
      height: 32%;
      border-radius: 60px;
      background-color: var(--color-success-container);
    }
    .road {
      position: absolute;
      background-color: var(--color-surface);
    }
    .road-h1 {
      left: -10%;
      top: 58%;
      width: 130%;
      height: 16px;
      transform: rotate(-8deg);
    }
    .road-h2 {
      left: -10%;
      top: 86%;
      width: 130%;
      height: 10px;
      transform: rotate(-2deg);
    }
    .road-v1 {
      left: 38%;
      top: -10%;
      width: 14px;
      height: 130%;
      transform: rotate(7deg);
    }
    .road-v2 {
      left: 70%;
      top: -10%;
      width: 10px;
      height: 130%;
      transform: rotate(-6deg);
    }
    .radius {
      position: absolute;
      border-radius: 200px;
      border-width: 1.5px;
      border-style: dashed;
      border-color: var(--color-danger);
      background-color: color-mix(in srgb, var(--color-danger) 8%, transparent);
    }
    .halo {
      position: absolute;
      border-radius: 22px;
      background-color: color-mix(in srgb, var(--color-primary) 22%, transparent);
    }
    .me {
      position: absolute;
      border-radius: 11px;
      border-width: 3px;
      border-color: #ffffff;
      background-color: var(--color-primary);
    }
    .pin {
      position: absolute;
      align-items: center;
    }
    .label {
      margin-top: 2px;
      padding: 2px var(--space-2);
      border-radius: 8px;
      border-width: 1px;
      border-color: var(--color-border);
      background-color: var(--color-surface);
    }
    .label-text {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text);
    }
  `,
})
export class AppMapSurface {
  readonly pins = input<readonly MapPin[]>([]);
  readonly me = input<{ x: number; y: number } | null>(null);
  /** Diameter in points of the search radius drawn around the user, or null for none. */
  readonly radius = input<number | null>(null);
  readonly height = input(220);

  protected readonly mapStyle = computed(() => ({ height: this.height() }));

  protected iconOf(kind: PinKind): IconName {
    return PIN_ICON[kind];
  }

  protected fillOf(kind: PinKind): Tone {
    return PIN_FILL[kind];
  }

  /** Places an element so that its anchor point sits at x%, y% of the map. */
  protected at(x: number, y: number, width: number, height: number, anchorY: number) {
    return { left: `${x}%`, top: `${y}%`, marginLeft: -width / 2, marginTop: -anchorY, width, height };
  }

  protected radiusStyle(diameter: number) {
    const me = this.me();
    const x = me?.x ?? 50;
    const y = me?.y ?? 50;
    return { left: `${x}%`, top: `${y}%`, width: diameter, height: diameter, marginLeft: -diameter / 2, marginTop: -diameter / 2 };
  }
}
