import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { PIXABAY_API_KEY } from '../../core/config.ts';
import type { Species } from '../../domain/models.ts';
import { PetPhotosRepository } from './pet-photos.repository.ts';

const API = 'https://pixabay.com/api/';
const TIMEOUT_MS = 10_000;
/** Pixabay's bounds for one page. */
const MIN = 3;
const MAX = 200;
/** Pixabay lets a search reach 500 hits; photos are drawn from the first few pages so they vary between launches. */
const REACHABLE = 500;
const PAGES_TO_DRAW_FROM = 5;

const QUERY: Record<Species, string> = { dog: 'dog pet', cat: 'cat pet' };

interface PixabayImage {
  readonly webformatURL?: string;
  readonly isLowQuality?: boolean;
}

/** The photo URLs in a Pixabay image answer; anything unexpected, or flagged low quality, yields none. */
export function parsePixabayPhotos(response: unknown): string[] {
  const hits = (response as { hits?: unknown } | null)?.hits;
  if (!Array.isArray(hits)) return [];
  return hits.flatMap((hit: PixabayImage) => (hit.webformatURL?.startsWith('https://') && !hit.isLowQuality ? [hit.webformatURL] : []));
}

/**
 * Pet photos from [Pixabay](https://pixabay.com/api/docs/), with the same key as the reels' videos.
 * Best-effort like every photo source: no key, a network failure or a rate limit answer with no
 * photos, never an error, and the next source in the chain gets its turn.
 */
@Injectable()
export class PixabayPhotosRepository extends PetPhotosRepository {
  private readonly http = inject(HttpClient);
  private readonly key = inject(PIXABAY_API_KEY);

  async photos(species: Species, count: number): Promise<string[]> {
    const wanted = Math.floor(count);
    if (!this.key || wanted < 1) return [];
    const perPage = Math.min(MAX, Math.max(MIN, wanted));
    const pages = Math.max(1, Math.min(PAGES_TO_DRAW_FROM, Math.floor(REACHABLE / perPage)));
    const params = new URLSearchParams({
      key: this.key, q: QUERY[species], image_type: 'photo', category: 'animals', safesearch: 'true',
      per_page: String(perPage), page: String(1 + Math.floor(Math.random() * pages)),
    });
    try {
      const response = await firstValueFrom(this.http.get<unknown>(`${API}?${params}`).pipe(timeout(TIMEOUT_MS)));
      return parsePixabayPhotos(response).slice(0, wanted);
    } catch {
      return [];
    }
  }
}
