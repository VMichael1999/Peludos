import { expect, test } from 'vitest';
import type { ReelVideo } from '../../domain/models.ts';
import { reelPost } from './reel-post.ts';

const video: ReelVideo = {
  id: '5631', duration: 12, thumbnail: 'https://t.example/a.jpg', videoUrl: 'https://v.example/a.mp4',
  width: 1280, height: 720, user: 'Coverr', tags: ['dog', 'drinking water', 'pet'], views: 289149, likes: 721,
};
const none = { liked: false, saved: false };

test('draws the maker, the hashtags and the views as a reel', () => {
  const post = reelPost(video, none);

  expect(post).toMatchObject({ id: '5631', petName: 'Coverr', kind: 'reel', videoUrl: 'https://v.example/a.mp4', photoUrl: 'https://t.example/a.jpg' });
  expect(post.caption).toBe('#dog #drinkingwater #pet · 289,1 mil vistas');
});

test('a liked reel counts the like', () => {
  expect(reelPost(video, { liked: true, saved: false })).toMatchObject({ liked: true, likes: 722 });
});

test('calls a video of cats a cat', () => {
  expect(reelPost({ ...video, tags: ['kitten'] }, none).species).toBe('cat');
  expect(reelPost(video, none).species).toBe('dog');
});

test('a sample reel has no video, no poster and no view count to show', () => {
  const post = reelPost({ ...video, videoUrl: null, thumbnail: '', views: 0 }, none);

  expect(post.videoUrl).toBeUndefined();
  expect(post.photoUrl).toBeUndefined();
  expect(post.caption).toBe('#dog #drinkingwater #pet');
});
