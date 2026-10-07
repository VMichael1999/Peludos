import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Species } from '../../domain/models.ts';
import { PetPhotosRepository } from './pet-photos.repository.ts';

const API = 'https://api.thecatapi.com/v1/images/search';
/** Without an API key the service answers at most this many photos per request, however many are asked for. */
const PER_REQUEST = 10;
/** The most photos one call gives: five requests' worth. */
const MAX = 50;

/** The photo URLs in a The Cat API answer; anything that is not a list of items with an https `url` yields none. */
export function parseCatApi(response: unknown): string[] {
  if (!Array.isArray(response)) return [];
  return response.flatMap((item: unknown) => {
    const url = (item as { url?: unknown } | null)?.url;
    return typeof url === 'string' && url.startsWith('https://') ? [url] : [];
  });
}

/**
 * Random cat photos from [The Cat API](https://thecatapi.com): free, and no key for light use. It is
 * best-effort, so a network failure answers with no photos and never an error. A long list is asked
 * for in batches, in parallel, and a photo that came twice is kept once. It only has cats:
 * any other species is answered with nothing, without a request. Only JPEG and PNG are asked for,
 * which keeps animated images out of a feed that is not built for them.
 */
@Injectable()
export class CatApiPhotosRepository extends PetPhotosRepository {
  private readonly http = inject(HttpClient);

  async photos(species: Species, count: number): Promise<string[]> {
    const wanted = Math.min(MAX, Math.floor(count));
    if (species !== 'cat' || wanted < 1) return [];
    const batches = Array.from({ length: Math.ceil(wanted / PER_REQUEST) }, (_, i) => Math.min(PER_REQUEST, wanted - i * PER_REQUEST));
    const lists = await Promise.all(batches.map((size) => this.batch(size)));
    return [...new Set(lists.flat())].slice(0, wanted);
  }

  /** One request. A failed batch is an empty one, so the others still count. */
  private async batch(size: number): Promise<string[]> {
    try {
      return parseCatApi(await firstValueFrom(this.http.get<unknown>(`${API}?limit=${size}&mime_types=jpg,png`)));
    } catch {
      return [];
    }
  }
}
