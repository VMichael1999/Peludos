import { Injectable } from '@angular/core';
import { ReelVideosRepository } from './reel-videos.repository.ts';

/** No videos at all: every reel keeps its placeholder. What the tests and a build without a key use. */
@Injectable()
export class MockReelVideosRepository extends ReelVideosRepository {
  async portrait(): Promise<string[]> {
    return [];
  }
}
