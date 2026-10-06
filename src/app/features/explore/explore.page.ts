import { Component, computed, inject, signal } from '@angular/core';
import { Pressable, ScrollView, Text, TextInput, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { loadable } from '../../core/loadable.ts';
import { Theme } from '../../core/theme/theme.ts';
import { PlacesRepository } from '../../data/places/places.repository.ts';
import { distance } from '../../domain/format.ts';
import type { Place, Post, Species } from '../../domain/models.ts';
import { AppAvatar } from '../../shared/ui/app-avatar.ts';
import { AppChip } from '../../shared/ui/app-chip.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppPhoto } from '../../shared/ui/app-photo.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { FeedStore } from '../feed/feed.store.ts';

type ExploreFilter = 'all' | Species;

/** Tile heights, repeated down the grid so the two columns do not line up: a mosaic, not a table. */
const HEIGHTS = [150, 110, 190, 130, 170, 120, 160, 140, 180];

@Component({
  selector: 'app-explore-page',
  imports: [AppAvatar, AppChip, AppIcon, AppPhoto, AppState, Pressable, ScrollView, Text, TextInput, View],
  template: `
    <view class="search">
      <app-icon name="search" [size]="22" tone="muted" />
      <text-input
        class="input"
        accessibilityLabel="Buscar"
        placeholder="Buscar mascotas, razas, tiendas"
        [placeholderTextColor]="theme.palette().textMuted"
        [selectionColor]="theme.palette().primary"
        returnKeyType="search"
        [(value)]="query"
      />
    </view>

    <scroll-view class="chips" [horizontal]="true" [showsHorizontalScrollIndicator]="false" [contentContainerStyle]="{ gap: 8, paddingHorizontal: 16 }">
      <app-chip label="Para ti" [selected]="filter() === 'all'" (press)="filter.set('all')" />
      <app-chip label="Perros" [selected]="filter() === 'dog'" (press)="filter.set('dog')" />
      <app-chip label="Gatos" [selected]="filter() === 'cat'" (press)="filter.set('cat')" />
      <app-chip label="Tiendas" (press)="nav.push('/stores')" />
    </scroll-view>

    <scroll-view class="fill" keyboardShouldPersistTaps="handled" [contentContainerStyle]="{ paddingBottom: 24 }">
      @if (shops().length) {
        <view class="heading">
          <text class="section">Tiendas cerca</text>
          <pressable class="all" accessibilityRole="link" accessibilityLabel="Ver todas las tiendas" (press)="nav.push('/stores')">
            <text class="all-text">Ver todas</text>
          </pressable>
        </view>
        <scroll-view [horizontal]="true" [showsHorizontalScrollIndicator]="false" [contentContainerStyle]="{ gap: 12, paddingHorizontal: 16 }">
          @for (place of shops(); track place.id) {
            <pressable class="shop" accessibilityRole="button" [accessibilityLabel]="place.name + ', ' + place.openLabel" (press)="nav.push('/store/' + place.id)">
              <app-avatar [name]="place.name" [size]="48" />
              <text class="shop-name" numberOfLines="1">{{ place.name }}</text>
              <text class="shop-meta" numberOfLines="1">{{ place.open ? 'Abierto' : 'Cerrado' }} · {{ km(place) }}</text>
            </pressable>
          }
        </scroll-view>
      }

      @if (tiles().length) {
        <view class="mosaic">
          <view class="column">
            @for (post of left(); track post.id) {
              <view class="tile" accessibilityRole="image" [accessibilityLabel]="post.petName + ': ' + post.caption" [style]="{ height: heightOf(post) }">
                <app-photo [tone]="post.tone" />
              </view>
            }
          </view>
          <view class="column">
            @for (post of right(); track post.id) {
              <view class="tile" accessibilityRole="image" [accessibilityLabel]="post.petName + ': ' + post.caption" [style]="{ height: heightOf(post) }">
                <app-photo [tone]="post.tone" />
              </view>
            }
          </view>
        </view>
      } @else {
        <app-state icon="search" title="Sin resultados" message="Prueba con otro nombre o quita el filtro." action="Limpiar búsqueda" (act)="clear()" />
      }
    </scroll-view>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    .search {
      min-height: 48px;
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
      margin: var(--space-2) var(--space-4);
      padding: 0 var(--space-4);
      border-radius: var(--radius-pill);
      background-color: var(--color-surface-2);
    }
    .input {
      flex: 1;
      padding: 0;
      font-size: var(--text-sm);
      color: var(--color-text);
    }
    .chips {
      flex-grow: 0;
      padding-bottom: var(--space-2);
    }
    .heading {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4) var(--space-2);
    }
    .section {
      font-size: var(--text-md);
      font-weight: 800;
      color: var(--color-text);
    }
    .all {
      min-height: var(--tap-target);
      justify-content: center;
    }
    .all-text {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-primary);
    }
    .shop {
      width: 128px;
      gap: 2px;
      padding: var(--space-3);
      border-width: 1px;
      border-color: var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
    }
    .shop-name {
      padding-top: var(--space-1);
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text);
    }
    .shop-meta {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .mosaic {
      flex-direction: row;
      gap: 6px;
      padding: var(--space-3) var(--space-4) 0;
    }
    .column {
      flex: 1;
      gap: 6px;
    }
    .tile {
      overflow: hidden;
      border-radius: var(--radius-md);
    }
  `,
})
export class ExplorePage {
  protected readonly nav = inject(NativeNavigation);
  protected readonly theme = inject(Theme);
  private readonly feed = inject(FeedStore);

  protected readonly query = signal('');
  protected readonly filter = signal<ExploreFilter>('all');

  private readonly places = loadable(() => inject(PlacesRepository).nearby({ kind: 'all', openNow: false, radiusKm: 3 }));
  private readonly needle = computed(() => this.query().trim().toLowerCase());

  protected readonly shops = computed<Place[]>(() =>
    (this.places.data() ?? [])
      .filter((p) => !this.needle() || (p.name + ' ' + p.tagline).toLowerCase().includes(this.needle()))
      .slice(0, 4),
  );

  protected readonly tiles = computed<Post[]>(() =>
    this.feed.posts().filter(
      (p) =>
        (this.filter() === 'all' || p.species === this.filter()) &&
        (!this.needle() || (p.petName + ' ' + p.caption).toLowerCase().includes(this.needle())),
    ),
  );
  protected readonly left = computed(() => this.tiles().filter((_, i) => i % 2 === 0));
  protected readonly right = computed(() => this.tiles().filter((_, i) => i % 2 === 1));

  protected km(place: Place): string {
    return distance(place.distanceKm);
  }

  /** A stable height per post, so a tile does not change size when the list is filtered. */
  protected heightOf(post: Post): number {
    const n = Number(post.id.replace(/\D/g, '')) || 0;
    return HEIGHTS[n % HEIGHTS.length]!;
  }

  protected clear(): void {
    this.query.set('');
    this.filter.set('all');
  }
}
