import { Injectable } from '@angular/core';
import type { ReelVideo } from '../../domain/models.ts';
import { VideoFeedRepository, type VideoPage, type VideoQuery } from './video-feed.repository.ts';

const SAMPLES: readonly Pick<ReelVideo, 'user' | 'tags' | 'views' | 'likes'>[] = [
  { user: 'Max', tags: ['perros', 'travesuras'], views: 8200, likes: 2400 },
  { user: 'Luna', tags: ['gatos', 'siesta'], views: 5100, likes: 1300 },
  { user: 'Toby', tags: ['cachorros', 'paseo'], views: 3900, likes: 980 },
];

/** Sample reels with no video, one page of them: what the tests and a build without a key use. */
@Injectable()
export class MockVideoFeedRepository extends VideoFeedRepository {
  async getVideos({ page }: VideoQuery): Promise<VideoPage> {
    if (page > 1) return { items: [], hasMore: false };
    return {
      items: SAMPLES.map((s, i) => ({ ...s, id: `sample-${i}`, duration: 0, thumbnail: '', videoUrl: null, width: 0, height: 0 })),
      hasMore: false,
    };
  }
}
