import { Component, DestroyRef, computed, effect, inject, input, resource, signal } from '@angular/core';
import { ActivityIndicator, Image, Pressable, SafeAreaView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { VideoFeedRepository } from '../../data/videos/video-feed.repository.ts';
import { PetPortraits } from '../../data/photos/pet-portraits.ts';
import type { ReelVideo, Story } from '../../domain/models.ts';
import { AppAvatar } from '../../shared/ui/app-avatar.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { FeedStore } from '../feed/feed.store.ts';
import { ReelVideo as ReelVideoPlayer } from '../reels/reel-video.ts';
import { ReelsStore } from '../reels/reels.store.ts';
import { buildStory } from './build-story.ts';
import { StoriesStore } from './stories.store.ts';

/** How often the progress bar moves, in seconds. */
const TICK = 0.1;

const hash = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * A pet's story, full screen: its newest posts and a couple of videos, one after another, with a
 * bar per page. A tap on the right goes forward and on the left back; the last page closes the story.
 * It is always dark and white-on-dark, like the reels.
 */
@Component({
  selector: 'app-story-page',
  imports: [ActivityIndicator, AppAvatar, AppIcon, Image, Pressable, ReelVideoPlayer, SafeAreaView, Text, View],
  template: `
    <view class="root">
      @if (loading()) {
        <view class="center"><activity-indicator size="large" color="#ffffff" /></view>
      } @else if (!items().length) {
        <view class="center"><text class="message">Esta historia aún no tiene momentos.</text></view>
      } @else {
        @for (item of shown(); track item.id) {
          @if (item.kind === 'video') {
            <app-reel-video [url]="item.url" [active]="true" [muted]="reels.muted()" />
          } @else {
            <image class="media" [src]="item.url" [alt]="story()?.petName ?? ''" resizeMode="cover" />
          }
        }
        <view class="scrim"></view>
        <pressable class="zone back" accessibilityRole="button" accessibilityLabel="Anterior" (press)="previous()"></pressable>
        <pressable class="zone forward" accessibilityRole="button" accessibilityLabel="Siguiente" (press)="next()"></pressable>
      }

      <safe-area-view class="top" [edges]="['top']" pointerEvents="box-none">
        <view class="bars">
          @for (item of items(); track item.id; let i = $index) {
            <view class="bar"><view class="fill" [style]="{ width: fill(i) }"></view></view>
          }
        </view>
        <view class="header">
          @if (story(); as s) {
            <app-avatar [name]="s.petName" [species]="s.species" [size]="36" />
            <text class="name" numberOfLines="1">{{ s.petName }}</text>
          }
          <pressable class="close" accessibilityRole="button" accessibilityLabel="Cerrar historia" (press)="close()">
            <app-icon name="close" [size]="28" tone="white" />
          </pressable>
        </view>
      </safe-area-view>

      @if (current(); as item) {
        @if (item.caption) {
          <safe-area-view class="bottom" [edges]="['bottom']" pointerEvents="none">
            <text class="caption" numberOfLines="3">{{ item.caption }}</text>
          </safe-area-view>
        }
      }
    </view>
  `,
  styles: `
    :host {
      flex: 1;
      background-color: #000000;
    }
    .root {
      flex: 1;
      background-color: #000000;
    }
    .center {
      flex: 1;
      align-items: center;
      justify-content: center;
    }
    .message {
      color: rgba(255, 255, 255, 0.85);
      font-size: var(--text-sm);
      font-weight: 600;
    }
    .media {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .scrim {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 30%;
      background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.7));
    }
    .zone {
      position: absolute;
      top: 96px;
      bottom: 0;
    }
    .back {
      left: 0;
      width: 30%;
    }
    .forward {
      left: 30%;
      right: 0;
    }
    .top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3) 0;
    }
    .bars {
      flex-direction: row;
      gap: 4px;
    }
    .bar {
      flex: 1;
      height: 3px;
      border-radius: 2px;
      overflow: hidden;
      background-color: rgba(255, 255, 255, 0.35);
    }
    .fill {
      height: 3px;
      background-color: #ffffff;
    }
    .header {
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
    }
    .name {
      flex: 1;
      font-size: var(--text-sm);
      font-weight: 800;
      color: #ffffff;
    }
    .close {
      width: var(--tap-target);
      height: var(--tap-target);
      align-items: center;
      justify-content: center;
    }
    .bottom {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 0 var(--space-4) var(--space-4);
    }
    .caption {
      font-size: var(--text-sm);
      color: #ffffff;
    }
  `,
})
export class StoryPage {
  private readonly nav = inject(NativeNavigation);
  private readonly feed = inject(FeedStore);
  private readonly portraits = inject(PetPortraits);
  private readonly videosSource = inject(VideoFeedRepository);
  private readonly watched = inject(StoriesStore);
  protected readonly reels = inject(ReelsStore);

  /** Bound from the `story/:id` route. */
  readonly id = input.required<string>();

  protected readonly story = computed<Story | undefined>(() => (this.feed.stories.data() ?? []).find((s) => s.id === this.id()));

  /** A couple of videos of the pet's species: a story has reels as well as posts. Best-effort, so a failure is no videos. */
  private readonly videos = resource({
    params: () => this.story(),
    loader: async ({ params }): Promise<readonly ReelVideo[]> => {
      if (!params) return [];
      try {
        const page = await this.videosSource.getVideos({
          query: params.species === 'cat' ? 'cats' : 'dogs', category: 'animals', page: 1 + (hash(params.petName) % 3), perPage: 8,
        });
        return page.items;
      } catch {
        return [];
      }
    },
  });

  protected readonly loading = computed(() => !this.story() || this.videos.isLoading());
  protected readonly items = computed(() => {
    const story = this.story();
    if (!story) return [];
    return buildStory({
      petName: story.petName,
      posts: this.feed.posts(),
      videos: this.videos.value() ?? [],
      gallery: this.portraits.gallery(story.petName, story.species, 3),
    });
  });

  protected readonly index = signal(0);
  private readonly elapsed = signal(0);
  protected readonly current = computed(() => this.items()[this.index()]);
  /** The page on show, as a one-item list so the page's player is rebuilt for each video. */
  protected readonly shown = computed(() => (this.current() ? [this.current()!] : []));

  constructor() {
    const timer = setInterval(() => this.tick(), TICK * 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    effect(() => {
      const story = this.story();
      if (story) this.watched.markSeen(story.id);
    });
  }

  protected fill(i: number): string {
    if (i < this.index()) return '100%';
    if (i > this.index()) return '0%';
    const seconds = this.current()?.seconds ?? 1;
    return `${Math.min(100, (this.elapsed() / seconds) * 100)}%`;
  }

  protected next(): void {
    if (this.index() + 1 < this.items().length) {
      this.index.update((i) => i + 1);
      this.elapsed.set(0);
    } else {
      this.close();
    }
  }

  protected previous(): void {
    this.elapsed.set(0);
    if (this.index() > 0) this.index.update((i) => i - 1);
  }

  protected close(): void {
    this.nav.back();
  }

  private tick(): void {
    const current = this.current();
    if (this.loading() || !current) return;
    this.elapsed.update((e) => e + TICK);
    if (this.elapsed() >= current.seconds) this.next();
  }
}
