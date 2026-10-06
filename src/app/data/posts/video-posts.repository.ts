import type { Post, Story } from '../../domain/models.ts';
import { ReelVideosRepository } from '../videos/reel-videos.repository.ts';
import { type NewPost, PostsRepository } from './posts.repository.ts';

/**
 * Gives the reels a real video. Like `PhotoPostsRepository`, it wraps any posts adapter and each
 * reel keeps the video it was given for as long as the app runs. A reel with no video available
 * keeps its placeholder. Photos are untouched.
 */
export class VideoPostsRepository extends PostsRepository {
  private readonly assigned = new Map<string, string>();

  constructor(
    private readonly posts: PostsRepository,
    private readonly videos: ReelVideosRepository,
  ) {
    super();
  }

  async feed(): Promise<Post[]> {
    const posts = await this.posts.feed();
    const missing = posts.filter((p) => p.kind === 'reel' && !p.videoUrl && !this.assigned.has(p.id));
    if (missing.length > 0) {
      const urls = await this.videos.portrait(missing.length);
      missing.forEach((post, i) => {
        const url = urls[i];
        if (url) this.assigned.set(post.id, url);
      });
    }
    return posts.map((p) => (p.videoUrl || !this.assigned.has(p.id) ? p : { ...p, videoUrl: this.assigned.get(p.id) }));
  }

  stories(): Promise<Story[]> {
    return this.posts.stories();
  }

  publish(post: NewPost): Promise<Post> {
    return this.posts.publish(post);
  }

  setLiked(postId: string, liked: boolean): Promise<void> {
    return this.posts.setLiked(postId, liked);
  }

  setSaved(postId: string, saved: boolean): Promise<void> {
    return this.posts.setSaved(postId, saved);
  }
}
