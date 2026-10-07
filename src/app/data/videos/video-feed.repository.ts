import type { ReelVideo } from '../../domain/models.ts';

export interface VideoQuery {
  /** What to look for: "dogs", "funny animals". */
  readonly query: string;
  /** The service's own grouping, when it has one. */
  readonly category?: string;
  /** From 1. */
  readonly page: number;
  readonly perPage: number;
}

export interface VideoPage {
  readonly items: readonly ReelVideo[];
  /** False once the service has nothing past this page. */
  readonly hasMore: boolean;
}

/** Why a page of videos could not be had: enough to choose the message, never a technical detail. */
export type VideoFeedFailure = 'network' | 'key' | 'rate-limit' | 'service';

export class VideoFeedError extends Error {
  constructor(readonly failure: VideoFeedFailure) {
    super(failure);
  }
}

/**
 * Where the reels' videos come from. Screens ask for a page of a search and know nothing of the
 * service behind it: its address, its key or the shape of its answer. A failure is a
 * `VideoFeedError`.
 */
export abstract class VideoFeedRepository {
  abstract getVideos(query: VideoQuery): Promise<VideoPage>;
}
