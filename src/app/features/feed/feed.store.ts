import { Injectable, computed, inject } from '@angular/core';
import { loadable } from '../../core/loadable.ts';
import { type NewPost, PostsRepository } from '../../data/posts/posts.repository.ts';
import type { Post } from '../../domain/models.ts';

/** The home feed and its stories. Likes update at once and are confirmed with the backend after. */
@Injectable({ providedIn: 'root' })
export class FeedStore {
  private readonly repo = inject(PostsRepository);

  readonly feed = loadable(() => this.repo.feed());
  readonly stories = loadable(() => this.repo.stories());
  readonly posts = computed(() => this.feed.data() ?? []);
  readonly status = this.feed.status;

  reload(): void {
    void this.feed.reload();
    void this.stories.reload();
  }

  async publish(input: NewPost): Promise<void> {
    await this.repo.publish(input);
    await this.feed.reload();
  }

  toggleLike(post: Post): void {
    this.patch(post.id, { liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) });
    void this.repo.setLiked(post.id, !post.liked);
  }

  toggleSave(post: Post): void {
    this.patch(post.id, { saved: !post.saved });
    void this.repo.setSaved(post.id, !post.saved);
  }

  private patch(id: string, change: Partial<Post>): void {
    this.feed.set(this.posts().map((p) => (p.id === id ? { ...p, ...change } : p)));
  }
}
