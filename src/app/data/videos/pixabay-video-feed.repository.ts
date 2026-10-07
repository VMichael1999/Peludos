import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { PIXABAY_API_KEY } from '../../core/config.ts';
import type { ReelVideo } from '../../domain/models.ts';
import { type VideoFeedFailure, VideoFeedError, VideoFeedRepository, type VideoPage, type VideoQuery } from './video-feed.repository.ts';

const API = 'https://pixabay.com/api/videos/';
const TIMEOUT_MS = 10_000;
/** A reel fills a phone screen, so a file whose short side is this long is sharp enough and still light. */
const SHARP_ENOUGH = 720;

interface PixabayFile {
  readonly url?: string;
  readonly width?: number;
  readonly height?: number;
  readonly size?: number;
  readonly thumbnail?: string;
}
interface PixabayHit {
  readonly id?: number;
  readonly duration?: number;
  readonly tags?: string;
  readonly user?: string;
  readonly views?: number;
  readonly likes?: number;
  readonly videos?: Readonly<Record<string, PixabayFile>>;
}

const shortSide = (f: PixabayFile) => Math.min(f.width ?? 0, f.height ?? 0);

/**
 * The file of a Pixabay video to play on a phone: a portrait one when there is one, then the
 * lightest that is sharp enough, or the sharpest there is when none is. Pixabay sends several
 * sizes, some with an empty address; only https ones count. Null when none can be played.
 */
export function pickFile(videos: PixabayHit['videos']): PixabayFile | null {
  const usable = Object.values(videos ?? {}).filter((f) => f.url?.startsWith('https://') && (f.width ?? 0) > 0 && (f.height ?? 0) > 0);
  const portrait = usable.filter((f) => (f.height ?? 0) > (f.width ?? 0));
  const pool = portrait.length ? portrait : usable;

  const sharp = pool.filter((f) => shortSide(f) >= SHARP_ENOUGH).sort((a, b) => shortSide(a) - shortSide(b) || (a.size ?? 0) - (b.size ?? 0));
  if (sharp[0]) return sharp[0];
  return [...pool].sort((a, b) => shortSide(b) - shortSide(a))[0] ?? null;
}

/** A Pixabay hit as the app's own video, or null when it has nothing to play. */
export function toReelVideo(hit: PixabayHit): ReelVideo | null {
  const file = pickFile(hit.videos);
  if (hit.id === undefined || !file?.url) return null;
  return {
    id: String(hit.id),
    duration: hit.duration ?? 0,
    thumbnail: file.thumbnail ?? '',
    videoUrl: file.url,
    width: file.width ?? 0,
    height: file.height ?? 0,
    user: hit.user ?? 'Pixabay',
    tags: (hit.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    views: hit.views ?? 0,
    likes: hit.likes ?? 0,
  };
}

/** A Pixabay answer as a page; anything that is not an answer is a service failure. */
export function parsePixabay(response: unknown, { page, perPage }: Pick<VideoQuery, 'page' | 'perPage'>): VideoPage {
  const answer = response as { hits?: unknown; totalHits?: unknown } | null;
  if (!answer || !Array.isArray(answer.hits)) throw new VideoFeedError('service');
  const total = typeof answer.totalHits === 'number' ? answer.totalHits : 0;
  return {
    items: answer.hits.flatMap((hit: PixabayHit) => toReelVideo(hit) ?? []),
    hasMore: page * perPage < total,
  };
}

/** What a failed request means, without keeping the request: its address carries the key. */
export function failureOf(error: unknown): VideoFeedFailure {
  if (error instanceof VideoFeedError) return error.failure;
  if (error instanceof TimeoutError) return 'network';
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'network';
    if (error.status === 429) return 'rate-limit';
    if (error.status === 400 || error.status === 401 || error.status === 403) return 'key';
  }
  return 'service';
}

/**
 * Pet videos from [Pixabay](https://pixabay.com/api/docs/) (free key; 100 requests a minute).
 * Pixabay's answer, its address and the key stay in this class: the rest of the app sees
 * `ReelVideo`s and a `VideoFeedError` that never carries the request.
 */
@Injectable()
export class PixabayVideoFeedRepository extends VideoFeedRepository {
  private readonly http = inject(HttpClient);
  private readonly key = inject(PIXABAY_API_KEY);

  async getVideos({ query, category, page, perPage }: VideoQuery): Promise<VideoPage> {
    if (!this.key) throw new VideoFeedError('key');
    const params = new URLSearchParams({ key: this.key, q: query, page: String(page), per_page: String(perPage), safesearch: 'true' });
    if (category) params.set('category', category);
    try {
      const response = await firstValueFrom(this.http.get<unknown>(`${API}?${params}`).pipe(timeout(TIMEOUT_MS)));
      return parsePixabay(response, { page, perPage });
    } catch (error) {
      throw new VideoFeedError(failureOf(error));
    }
  }
}
