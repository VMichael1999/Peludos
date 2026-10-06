import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PEXELS_API_KEY } from '../../core/config.ts';
import { ReelVideosRepository } from './reel-videos.repository.ts';

const API = 'https://api.pexels.com/videos/search';
const MAX = 40;
/** A reel is full-screen on a phone, so the file closest to this width is plenty and keeps the download light. */
const TARGET_WIDTH = 720;

interface PexelsFile {
  readonly link?: string;
  readonly file_type?: string;
  readonly width?: number;
  readonly height?: number;
}
interface PexelsVideo {
  readonly video_files?: readonly PexelsFile[];
}

/** The best mp4 of a Pexels video for a phone: portrait, https, closest to `TARGET_WIDTH`. Null if none fits. */
export function pickFile(video: PexelsVideo): string | null {
  const usable = (video.video_files ?? []).filter(
    (f) => f.file_type === 'video/mp4' && f.link?.startsWith('https://') && (f.height ?? 0) >= (f.width ?? 0),
  );
  usable.sort((a, b) => Math.abs((a.width ?? 0) - TARGET_WIDTH) - Math.abs((b.width ?? 0) - TARGET_WIDTH));
  return usable[0]?.link ?? null;
}

/** The video URLs in a Pexels search answer; anything unexpected yields none. */
export function parsePexels(response: unknown): string[] {
  const videos = (response as { videos?: unknown } | null)?.videos;
  if (!Array.isArray(videos)) return [];
  return videos.flatMap((v: PexelsVideo) => pickFile(v) ?? []);
}

/**
 * Vertical pet videos from [Pexels](https://www.pexels.com/api/) (free key; 200 requests an hour).
 * Best-effort: no key, a network failure or a rate limit all answer with no videos, never an error.
 * Pexels asks for a visible link back to Pexels wherever its videos are shown.
 */
@Injectable()
export class PexelsVideosRepository extends ReelVideosRepository {
  private readonly http = inject(HttpClient);
  private readonly key = inject(PEXELS_API_KEY);

  async portrait(count: number): Promise<string[]> {
    const wanted = Math.min(MAX, Math.floor(count));
    if (!this.key || wanted < 1) return [];
    const query = encodeURIComponent('cute dog cat pets');
    try {
      const response = await firstValueFrom(
        this.http.get<unknown>(`${API}?query=${query}&orientation=portrait&size=medium&per_page=${wanted}`, {
          headers: { Authorization: this.key },
        }),
      );
      return [...new Set(parsePexels(response))].slice(0, wanted);
    } catch {
      return [];
    }
  }
}
