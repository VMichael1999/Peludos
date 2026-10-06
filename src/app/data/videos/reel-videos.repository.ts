/**
 * Where reel videos come from. Like photos, videos are decoration the app never depends on: an
 * adapter that cannot get any answers with an empty list, and the reels keep their placeholders.
 */
export abstract class ReelVideosRepository {
  /** Up to `count` vertical video URLs (mp4), in no particular order. */
  abstract portrait(count: number): Promise<string[]>;
}
