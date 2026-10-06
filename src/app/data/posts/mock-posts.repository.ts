import { Injectable } from '@angular/core';
import type { Post, Story } from '../../domain/models.ts';
import { POSTS, STORIES } from '../mock/seed.ts';
import { type NewPost, PostsRepository } from './posts.repository.ts';

const wait = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

@Injectable()
export class MockPostsRepository extends PostsRepository {
  private posts: Post[] = [...POSTS];

  async feed(): Promise<Post[]> {
    await wait();
    return [...this.posts];
  }

  async stories(): Promise<Story[]> {
    await wait(250);
    return [...STORIES];
  }

  async publish(input: NewPost): Promise<Post> {
    await wait(600);
    const post: Post = {
      id: 'p' + (this.posts.length + 1), ...input, minutesAgo: 0, likes: 0, comments: 0, liked: false, saved: false, tone: 'blue',
    };
    this.posts = [post, ...this.posts];
    return post;
  }

  async setLiked(postId: string, liked: boolean): Promise<void> {
    this.posts = this.posts.map((p) => (p.id === postId ? { ...p, liked, likes: p.likes + (liked ? 1 : -1) } : p));
  }

  async setSaved(postId: string, saved: boolean): Promise<void> {
    this.posts = this.posts.map((p) => (p.id === postId ? { ...p, saved } : p));
  }
}
