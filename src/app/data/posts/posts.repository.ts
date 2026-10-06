import type { Post, Species, Story } from '../../domain/models.ts';

export interface NewPost {
  readonly petName: string;
  readonly species: Species;
  readonly ownerName: string;
  readonly caption: string;
  readonly kind: 'photo' | 'reel';
}

export abstract class PostsRepository {
  abstract feed(): Promise<Post[]>;
  abstract stories(): Promise<Story[]>;
  abstract setLiked(postId: string, liked: boolean): Promise<void>;
  abstract publish(post: NewPost): Promise<Post>;
  abstract setSaved(postId: string, saved: boolean): Promise<void>;
}
