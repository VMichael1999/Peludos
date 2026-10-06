import { Component, computed, inject, input, signal } from '@angular/core';
import { ScrollView, Text, View } from '@ng-native/components';
import { Sharing } from '@ng-native/device';
import type { Post } from '../../domain/models.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { FeedStore } from '../feed/feed.store.ts';
import { ReelCard } from './reel-card.ts';

/** Reels: one per screen, swipe up for the next. Always dark, because the video leads. */
@Component({
  selector: 'app-reels-page',
  imports: [AppIcon, AppSkeleton, AppState, ReelCard, ScrollView, Text, View],
  template: `
    <view class="root" (layout)="measure($event.nativeEvent.layout.height)">
      @switch (feed.status()) {
        @case ('loading') {
          <view class="loading"><app-skeleton width="100%" [height]="height()" [radius]="0" /></view>
        }
        @case ('error') {
          <app-state icon="wifiOff" title="No pudimos cargar los reels" message="Revisa tu conexión e inténtalo de nuevo." action="Reintentar" actionVariant="primary" [bad]="true" (act)="feed.reload()" />
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
              @for (reel of reels(); track reel.id) {
                <app-reel-card [post]="reel" [height]="height()" (like)="feed.toggleLike($event)" (save)="feed.toggleSave($event)" (share)="send($event)" />
              }
            </scroll-view>
          }
        }
      }
      <view class="top">
        <text class="title">Reels</text>
        <view class="camera" accessibilityLabel="Cámara" accessible="true"><app-icon name="camera" [size]="26" tone="white" /></view>
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
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-4);
    }
    .title {
      font-size: var(--text-xl);
      font-weight: 800;
      color: #ffffff;
    }
    .camera {
      width: var(--tap-target);
      height: var(--tap-target);
      align-items: center;
      justify-content: center;
    }
  `,
})
export class ReelsPage {
  protected readonly feed = inject(FeedStore);
  private readonly sharing = inject(Sharing);

  /** True while this tab is the one on screen: when videos exist, only the current one plays. */
  readonly active = input(false);

  protected readonly height = signal(0);
  protected readonly current = signal(0);
  protected readonly reels = computed(() => this.feed.posts().filter((p) => p.kind === 'reel'));

  protected measure(height: number): void {
    this.height.set(Math.round(height));
  }

  /** The reel the page came to rest on. */
  protected settle(offset: number): void {
    if (this.height() > 0) this.current.set(Math.round(offset / this.height()));
  }

  protected async send(post: Post): Promise<void> {
    await this.sharing.share({ title: 'Reel de ' + post.petName, message: `${post.petName}: ${post.caption} Míralo en Peludos.` });
  }
}
