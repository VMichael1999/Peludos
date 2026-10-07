import { Injectable, computed, inject, signal } from '@angular/core';
import type { Post, ReelVideo } from '../../domain/models.ts';
import { type VideoFeedFailure, VideoFeedError, VideoFeedRepository } from '../../data/videos/video-feed.repository.ts';
import { reelPost } from './reel-post.ts';

export interface ReelCategory {
  readonly id: string;
  readonly label: string;
  /** What the video service is asked to search for. */
  readonly query: string;
  readonly category?: string;
}

/** The feed's categories. Adding one is adding a line: nothing else knows the list. */
export const REEL_CATEGORIES: readonly ReelCategory[] = [
  { id: 'dogs', label: 'Perros', query: 'dogs', category: 'animals' },
  { id: 'cats', label: 'Gatos', query: 'cats', category: 'animals' },
  { id: 'puppies', label: 'Cachorros', query: 'puppies', category: 'animals' },
  { id: 'kittens', label: 'Gatitos', query: 'kittens', category: 'animals' },
  { id: 'pets', label: 'Mascotas', query: 'pets', category: 'animals' },
  { id: 'animals', label: 'Animales', query: 'animals', category: 'animals' },
  { id: 'funny', label: 'Divertidos', query: 'funny animals', category: 'animals' },
];

export type ReelsStatus = 'loading' | 'ready' | 'empty' | 'error';

const PAGE_SIZE = 10;

/** What to tell the person about a failure: plain words, never the technical reason. */
export function failureMessage(failure: VideoFeedFailure | null): string {
  if (failure === 'rate-limit') return 'Hay muchas solicitudes ahora mismo. Espera un momento e inténtalo de nuevo.';
  if (failure === 'network') return 'No hay conexión. Revisa tu internet e inténtalo de nuevo.';
  return 'No pudimos cargar los videos. Intenta nuevamente.';
}

/**
 * The reels feed: the category on show, the videos fetched so far a page at a time, and the
 * person's likes, saves and sound setting, which stay while they move around the feed.
 */
@Injectable({ providedIn: 'root' })
export class ReelsStore {
  private readonly repo = inject(VideoFeedRepository);

  readonly categories = REEL_CATEGORIES;
  readonly category = signal<ReelCategory>(REEL_CATEGORIES[0]);
  readonly muted = signal(false);

  readonly status = signal<ReelsStatus>('loading');
  /** Why the first page failed, or why a later one did. */
  readonly failure = signal<VideoFeedFailure | null>(null);
  readonly loadingMore = signal(false);
  readonly moreFailed = signal(false);
  readonly hasMore = signal(true);

  private readonly videos = signal<readonly ReelVideo[]>([]);
  private readonly liked = signal<ReadonlySet<string>>(new Set());
  private readonly saved = signal<ReadonlySet<string>>(new Set());

  readonly reels = computed<Post[]>(() =>
    this.videos().map((v) => reelPost(v, { liked: this.liked().has(v.id), saved: this.saved().has(v.id) })),
  );
  readonly message = computed(() => failureMessage(this.failure()));

  private page = 0;
  private asking = false;
  /** Changes when the feed starts over, so an answer to an old question is thrown away. */
  private generation = 0;

  constructor() {
    void this.reload();
  }

  select(category: ReelCategory): void {
    if (category.id === this.category().id) return;
    this.category.set(category);
    void this.reload();
  }

  /** Starts the feed over: the first page of the current category. */
  async reload(): Promise<void> {
    this.generation++;
    this.page = 0;
    this.asking = false;
    this.videos.set([]);
    this.hasMore.set(true);
    this.moreFailed.set(false);
    this.loadingMore.set(false);
    this.failure.set(null);
    this.status.set('loading');
    await this.fetchNext();
  }

  /** The next page, when there is one and none is already on its way. */
  async loadMore(): Promise<void> {
    if (this.status() !== 'ready' || !this.hasMore() || this.asking) return;
    this.moreFailed.set(false);
    this.loadingMore.set(true);
    await this.fetchNext();
  }

  toggleLike(post: Post): void {
    this.liked.update((set) => toggled(set, post.id));
  }

  toggleSave(post: Post): void {
    this.saved.update((set) => toggled(set, post.id));
  }

  toggleMuted(): void {
    this.muted.update((m) => !m);
  }

  private async fetchNext(): Promise<void> {
    const generation = this.generation;
    const first = this.page === 0;
    const { query, category } = this.category();
    this.asking = true;
    try {
      const answer = await this.repo.getVideos({ query, category, page: this.page + 1, perPage: PAGE_SIZE });
      if (generation !== this.generation) return;
      this.page++;
      const known = new Set(this.videos().map((v) => v.id));
      const fresh = answer.items.filter((v) => !known.has(v.id));
      this.videos.update((all) => [...all, ...fresh]);
      this.hasMore.set(answer.hasMore);
      this.status.set(this.videos().length ? 'ready' : 'empty');
      this.asking = false;
      this.loadingMore.set(false);
      // A page of only repeats adds nothing to scroll to, so ask for the one after it.
      if (!fresh.length && answer.hasMore && this.videos().length) await this.loadMore();
    } catch (error) {
      if (generation !== this.generation) return;
      this.asking = false;
      this.loadingMore.set(false);
      this.failure.set(error instanceof VideoFeedError ? error.failure : 'service');
      if (first) this.status.set('error');
      else this.moreFailed.set(true);
    }
  }
}

function toggled(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(set);
  if (!next.delete(id)) next.add(id);
  return next;
}
