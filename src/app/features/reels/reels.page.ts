import { Component, effect, inject, input, signal } from '@angular/core';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from '@ng-native/components';
import { Sharing } from '@ng-native/device';
import type { Post } from '../../domain/models.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { ReelCard } from './reel-card.ts';
import { type ReelCategory, ReelsStore } from './reels.store.ts';

/** The next page is asked for when this few reels are left ahead of the one on screen. */
const PREFETCH_AHEAD = 3;

/** Reels: one per screen, swipe up for the next. Always dark, because the video leads. */
@Component({
  selector: 'app-reels-page',
  imports: [ActivityIndicator, AppButton, AppIcon, AppSkeleton, AppState, Pressable, ReelCard, ScrollView, Text, View],
  template: `
    <view class="root" (layout)="measure($event.nativeEvent.layout.height)">
      @switch (store.status()) {
        @case ('loading') {
          <view class="loading"><app-skeleton width="100%" [height]="height()" [radius]="0" /></view>
        }
        @case ('error') {
          <app-state icon="wifiOff" title="No pudimos cargar los videos" [message]="store.message()" action="Reintentar" actionVariant="primary" [bad]="true" (act)="store.reload()" />
        }
        @case ('empty') {
          <app-state icon="search" title="No encontramos videos" message="Prueba con otra categoría." action="Reintentar" (act)="store.reload()" />
        }
        @default {
          @if (height() > 0) {
            <scroll-view
              class="pager"
              [pagingEnabled]="true"
              [showsVerticalScrollIndicator]="false"
              [bounces]="false"
              decelerationRate="fast"
              (momentumScrollEnd)="settle($event.nativeEvent.contentOffset.y)"
            >
              @for (reel of store.reels(); track reel.id; let i = $index) {
                <app-reel-card
                  [post]="reel"
                  [height]="height()"
                  [playing]="active() && i === current()"
                  [preload]="active() && i === current() + 1"
                  [muted]="store.muted()"
                  (like)="store.toggleLike($event)"
                  (save)="store.toggleSave($event)"
                  (share)="send($event)"
                />
              }
              @if (store.loadingMore() || store.moreFailed() || !store.hasMore()) {
                <view class="end" [style]="{ height: height() }">
                  @if (store.loadingMore()) {
                    <activity-indicator size="large" color="#ffffff" />
                    <text class="end-text">Cargando más videos…</text>
                  } @else if (store.moreFailed()) {
                    <text class="end-text">{{ store.message() }}</text>
                    <app-button label="Reintentar" [compact]="true" (press)="store.loadMore()" />
                  } @else {
                    <text class="end-text">Llegaste al final. Prueba otra categoría.</text>
                  }
                </view>
              }
            </scroll-view>
          }
        }
      }
      <view class="top">
        <view class="bar">
          <text class="title">Reels</text>
          <view class="buttons">
            <pressable class="round" accessibilityRole="button" [accessibilityLabel]="store.muted() ? 'Activar el sonido' : 'Silenciar'" (press)="store.toggleMuted()">
              <app-icon [name]="store.muted() ? 'volumeOff' : 'volume'" [size]="26" tone="white" />
            </pressable>
            <view class="round" accessibilityLabel="Cámara" accessible="true"><app-icon name="camera" [size]="26" tone="white" /></view>
          </view>
        </view>
        <scroll-view [horizontal]="true" [showsHorizontalScrollIndicator]="false" [contentContainerStyle]="{ gap: 8, paddingHorizontal: 16 }">
          @for (category of store.categories; track category.id) {
            <pressable class="chip" accessibilityRole="button" [accessibilityLabel]="category.label" [accessibilityState]="{ selected: store.category().id === category.id }" [attr.data-selected]="store.category().id === category.id || null" (press)="choose(category)">
              <text class="chip-text" [attr.data-selected]="store.category().id === category.id || null">{{ category.label }}</text>
            </pressable>
          }
        </scroll-view>
      </view>
    </view>
  `,
  styles: `
    :host {
      flex: 1;
      background-color: #0a0f1a;
    }
    .root {
      flex: 1;
    }
    .pager {
      flex: 1;
    }
    .loading {
      flex: 1;
    }
    .top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      gap: var(--space-1);
    }
    .bar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-4) 0;
    }
    .buttons {
      flex-direction: row;
    }
    .chip {
      min-height: 32px;
      padding: 0 var(--space-3);
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-pill);
      background-color: rgba(10, 15, 26, 0.55);
    }
    .chip[data-selected] {
      background-color: #ffffff;
    }
    .chip-text {
      font-size: var(--text-xs);
      font-weight: 700;
      color: #ffffff;
    }
    .chip-text[data-selected] {
      color: #0a0f1a;
    }
    .end {
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: 0 var(--space-6);
    }
    .end-text {
      text-align: center;
      font-size: var(--text-sm);
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
    }
    .title {
      font-size: var(--text-xl);
      font-weight: 800;
      color: #ffffff;
    }
    .round {
      width: var(--tap-target);
      height: var(--tap-target);
      align-items: center;
      justify-content: center;
    }
  `,
})
export class ReelsPage {
  protected readonly store = inject(ReelsStore);
  private readonly sharing = inject(Sharing);

  /** True while this tab is the one on screen: only then does a video play. */
  readonly active = input(false);

  protected readonly height = signal(0);
  protected readonly current = signal(0);

  constructor() {
    // Near the end of what is loaded, ask for the next page. The store ignores the ask while one
    // is on its way or when there is no more, so this can run on every move without duplicates.
    effect(() => {
      if (this.store.status() === 'ready' && this.current() >= this.store.reels().length - PREFETCH_AHEAD) void this.store.loadMore();
    });
  }

  protected measure(height: number): void {
    this.height.set(Math.round(height));
  }

  /** The reel the page came to rest on. */
  protected settle(offset: number): void {
    if (this.height() > 0) this.current.set(Math.round(offset / this.height()));
  }

  /** A new category starts at its first reel. */
  protected choose(category: ReelCategory): void {
    this.current.set(0);
    this.store.select(category);
  }

  protected async send(post: Post): Promise<void> {
    await this.sharing.share({ title: 'Reel de ' + post.petName, message: `${post.petName}: ${post.caption} Míralo en Peludos.` });
  }
}
