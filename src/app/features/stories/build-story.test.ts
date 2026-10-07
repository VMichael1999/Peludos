import { expect, test } from 'vitest';
import type { Post, ReelVideo } from '../../domain/models.ts';
import { buildStory } from './build-story.ts';

const post = (id: string, petName: string, minutesAgo: number, photoUrl?: string): Post => ({
  id, petName, species: 'dog', ownerName: 'o', caption: 'c' + id, minutesAgo, likes: 0, comments: 0, liked: false, saved: false, tone: 'blue', kind: 'photo', photoUrl,
});
const video = (id: string, duration = 12, videoUrl: string | null = `https://v.example/${id}.mp4`): ReelVideo => ({
  id, duration, thumbnail: '', videoUrl, width: 1, height: 1, user: 'u', tags: ['dog', 'happy pup'], views: 0, likes: 0,
});

test('a story is the pet\'s own newest posts, with videos between them', () => {
  const items = buildStory({
    petName: 'Canela',
    posts: [post('1', 'Canela', 50, 'https://p/1.jpg'), post('2', 'Max', 5, 'https://p/2.jpg'), post('3', 'Canela', 10, 'https://p/3.jpg')],
    videos: [video('a'), video('b')],
    gallery: [],
  });

  expect(items.map((i) => i.id)).toEqual(['post-3', 'video-a', 'post-1', 'video-b']);
  expect(items.map((i) => i.kind)).toEqual(['photo', 'video', 'photo', 'video']);
});

test('other pets\' posts and posts with no photo are not in it', () => {
  const items = buildStory({ petName: 'Canela', posts: [post('1', 'Max', 5, 'https://p/1.jpg'), post('2', 'Canela', 5)], videos: [], gallery: ['https://g/1.jpg'] });

  expect(items.map((i) => i.id)).toEqual(['gallery-0']);
});

test('a video stays as long as it lasts, within limits', () => {
  const seconds = (duration: number) => buildStory({ petName: 'x', posts: [], videos: [video('a', duration)], gallery: [] })[0].seconds;

  expect(seconds(1)).toBe(4);
  expect(seconds(7)).toBe(7);
  expect(seconds(60)).toBe(10);
});

test('a video with no address (a sample reel) is left out', () => {
  expect(buildStory({ petName: 'x', posts: [], videos: [video('a', 10, null)], gallery: [] })).toEqual([]);
});

test('caps the posts, the videos and the gallery fallback', () => {
  const posts = Array.from({ length: 9 }, (_, i) => post(String(i), 'Canela', i, `https://p/${i}.jpg`));
  const videos = Array.from({ length: 5 }, (_, i) => video(String(i)));

  expect(buildStory({ petName: 'Canela', posts, videos, gallery: [] })).toHaveLength(6);
  expect(buildStory({ petName: 'Z', posts: [], videos: [], gallery: ['a', 'b', 'c', 'd', 'e'] })).toHaveLength(3);
});

test('a pet with nothing has an empty story', () => {
  expect(buildStory({ petName: 'Z', posts: [], videos: [], gallery: [] })).toEqual([]);
});
