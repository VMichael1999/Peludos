import { Component, computed, inject } from '@angular/core';
import { Pressable, ScrollView, Text, View } from '@ng-native/components';
import { DeepLinks } from '@ng-native/device';
import { NativeNavigation } from '@ng-native/router';
import { fitPins } from '../../data/places/google-places.mapper.ts';
import { distance, stars } from '../../domain/format.ts';
import type { Place } from '../../domain/models.ts';
import { PlacesRepository } from '../../data/places/places.repository.ts';
import { AppAvatar } from '../../shared/ui/app-avatar.ts';
import { AppChip } from '../../shared/ui/app-chip.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppMapSurface, type MapPin } from '../../shared/ui/app-map-surface.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { type PlaceFilter, PlacesStore } from './places.store.ts';

/** The drawn map is small: it shows the nearest few, and the list below has them all. */
const MAP_PINS = 12;

const FILTERS: readonly { readonly id: PlaceFilter; readonly label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'vet', label: 'Veterinarias' },
  { id: 'shop', label: 'Pet shops' },
  { id: 'groomer', label: 'Peluquería' },
];

@Component({
  selector: 'app-directory-page',
  imports: [AppAvatar, AppChip, AppIcon, AppMapSurface, AppNavBar, AppScreen, AppSkeleton, AppState, Pressable, ScrollView, Text, View],
  template: `
    <app-screen>
      <app-nav-bar [title]="store.title()" />
      <scroll-view class="chips" [horizontal]="true" [showsHorizontalScrollIndicator]="false" [contentContainerStyle]="{ gap: 8, paddingHorizontal: 16 }">
        @for (filter of filters; track filter.id) {
          <app-chip [label]="filter.label" [selected]="store.kind() === filter.id" (press)="store.kind.set(filter.id)" />
        }
      </scroll-view>
      <app-map-surface [height]="150" [pins]="pins()" [me]="{ x: 46, y: 58 }" />

      <view class="summary">
        <text class="count">{{ summary() }}</text>
        <app-chip label="Abierto ahora" [selected]="store.openNow()" (press)="store.openNow.set(!store.openNow())" />
      </view>

      @if (notice(); as notice) {
        <text class="notice" accessibilityRole="alert">{{ notice }}</text>
      }

      @switch (store.results.status()) {
        @case ('loading') {
          <view class="skeletons">
            @for (n of [1, 2, 3]; track n) {
              <view class="skeleton-row">
                <app-skeleton [width]="56" [height]="56" [radius]="14" />
                <view class="grow">
                  <app-skeleton width="60%" [height]="14" />
                  <app-skeleton width="80%" [height]="11" />
                </view>
              </view>
            }
          </view>
        }
        @case ('error') {
          <app-state icon="wifiOff" title="No pudimos cargar los lugares" message="Revisa tu conexión e inténtalo de nuevo." action="Reintentar" actionVariant="primary" [bad]="true" (act)="store.results.reload()" />
        }
        @case ('empty') {
          <app-state icon="search" title="Nada cerca con ese filtro" message="Prueba con otra categoría o quita «Abierto ahora»." action="Ver todas" (act)="reset()" />
        }
        @default {
          <scroll-view class="fill" [contentContainerStyle]="{ paddingBottom: 32 }">
            @for (place of places(); track place.id) {
              <pressable class="row" accessibilityRole="button" [accessibilityLabel]="place.name + ', a ' + km(place) + ', ' + place.openLabel" (press)="open(place)">
                <app-avatar [name]="place.name" [size]="56" />
                <view class="info">
                  <text class="name" numberOfLines="1">{{ place.name }}</text>
                  <text class="meta" numberOfLines="1">{{ place.tagline }} · {{ km(place) }}</text>
                  <text class="open" numberOfLines="1" [attr.data-open]="isOpen(place) || null">{{ place.openLabel }}{{ rating(place) }}</text>
                </view>
                <pressable class="go" accessibilityRole="button" [accessibilityLabel]="'Cómo llegar a ' + place.name" (press)="navigate(place)">
                  <app-icon name="navigate" [size]="24" tone="onPrimary" />
                </pressable>
              </pressable>
            }
          </scroll-view>
        }
      }
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    .chips {
      flex-grow: 0;
      padding-bottom: var(--space-3);
    }
    .summary {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4) var(--space-1);
    }
    .count {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text-muted);
    }
    .notice {
      margin: var(--space-1) var(--space-4) 0;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      background-color: var(--color-surface-2);
    }
    .row {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-bottom-width: 1px;
      border-bottom-color: var(--color-border);
    }
    .info {
      flex: 1;
      gap: 2px;
    }
    .name {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .meta {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .open {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-muted);
    }
    .open[data-open] {
      color: var(--color-success);
    }
    .go {
      width: var(--tap-target);
      height: var(--tap-target);
      border-radius: 24px;
      align-items: center;
      justify-content: center;
      background-color: var(--color-primary);
    }
    .skeletons {
      padding: var(--space-3) var(--space-4);
      gap: var(--space-4);
    }
    .skeleton-row {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
    }
    .grow {
      flex: 1;
      gap: var(--space-2);
    }
  `,
})
export class DirectoryPage {
  private readonly nav = inject(NativeNavigation);
  private readonly links = inject(DeepLinks);
  protected readonly store = inject(PlacesStore);
  protected readonly filters = FILTERS;
  protected readonly notice = inject(PlacesRepository).notice;

  protected readonly places = computed(() => this.store.results.data() ?? []);
  protected readonly pins = computed<MapPin[]>(() => {
    const shown = this.store.results.status() === 'loading' ? [] : this.places().slice(0, MAP_PINS);
    return fitPins(shown, this.store.radiusKm()).map((p) => ({ id: p.id, x: p.pin.x, y: p.pin.y, kind: p.kind }));
  });
  protected readonly summary = computed(() => {
    if (this.store.results.status() === 'loading') return 'Buscando lugares cerca…';
    const n = this.places().length;
    return `${n} a menos de ${this.store.radiusKm()} km`;
  });

  /** Green only for "Abierto ...": a place about to close reads as plain text. */
  protected isOpen(place: Place): boolean {
    return place.open && place.openLabel.startsWith('Abierto');
  }

  protected km(place: Place): string {
    return distance(place.distanceKm);
  }

  /** " · 4,8 ★", or nothing when there is no rating. */
  protected rating(place: Place): string {
    const value = stars(place.rating);
    return value ? ' · ' + value : '';
  }

  protected open(place: Place): void {
    void this.nav.push('/store/' + place.id);
  }

  /** Hands the place to the device's maps app, which draws the route. */
  protected navigate(place: Place): void {
    this.links.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.name));
  }

  protected reset(): void {
    this.store.kind.set('all');
    this.store.openNow.set(false);
  }
}
