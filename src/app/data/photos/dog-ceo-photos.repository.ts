import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Species } from '../../domain/models.ts';
import { PetPhotosRepository } from './pet-photos.repository.ts';

const API = 'https://dog.ceo/api/breeds/image/random';
/** The most photos Dog CEO gives in one request. */
const MAX = 50;

interface DogCeoResponse {
  readonly status?: string;
  readonly message?: unknown;
}

/** The photo URLs in a Dog CEO answer; anything that is not a list of https URLs yields none. */
export function parseDogCeo(response: DogCeoResponse | null | undefined): string[] {
  if (response?.status !== 'success' || !Array.isArray(response.message)) return [];
  return response.message.filter((url): url is string => typeof url === 'string' && url.startsWith('https://'));
}

/**
 * Random dog photos from [Dog CEO](https://dog.ceo/dog-api): free, no key. It is best-effort, so a
 * network failure answers with no photos and never an error. It only has dogs: any other species is
 * answered with nothing, without a request.
 */
@Injectable()
export class DogCeoPhotosRepository extends PetPhotosRepository {
  private readonly http = inject(HttpClient);

  async photos(species: Species, count: number): Promise<string[]> {
    const wanted = Math.min(MAX, Math.floor(count));
    if (species !== 'dog' || wanted < 1) return [];
    try {
      return parseDogCeo(await firstValueFrom(this.http.get<DogCeoResponse>(`${API}/${wanted}`)));
    } catch {
      return [];
    }
  }
}
