import type { Post, Species, Story } from '../../domain/models.ts';
import { PetPhotosRepository } from '../photos/pet-photos.repository.ts';
import { type NewPost, PostsRepository } from './posts.repository.ts';

/**
 * Gives the posts a real photo of their species. It wraps any posts adapter, so the backend that
 * serves the posts knows nothing about where photos come from. Each post keeps the photo it was
 * given for as long as the app runs, so a reload never reshuffles what the person was looking at.
 * A post whose species has no photos available simply keeps its placeholder.
 */
export class PhotoPostsRepository extends PostsRepository {
  private readonly assigned = new Map<string, string>();

  constructor(
    private readonly posts: PostsRepository,
    private readonly photos: PetPhotosRepository,
  ) {
    super();
  }

  async feed(): Promise<Post[]> {
    const posts = await this.posts.feed();
    const missing = new Map<Species, Post[]>();
    for (const post of posts) {
      if (post.photoUrl || this.assigned.has(post.id)) continue;
      missing.set(post.species, [...(missing.get(post.species) ?? []), post]);
    }
    await Promise.all(
      [...missing].map(async ([species, wanting]) => {
        const urls = await this.photos.photos(species, wanting.length);
        wanting.forEach((post, i) => {
          const url = urls[i];
          if (url) this.assigned.set(post.id, url);
        });
      }),
    );
    return posts.map((p) => (p.photoUrl || !this.assigned.has(p.id) ? p : { ...p, photoUrl: this.assigned.get(p.id) }));
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
