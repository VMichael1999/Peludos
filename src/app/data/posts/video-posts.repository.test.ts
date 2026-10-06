import { expect, test, vi } from 'vitest';
import { ReelVideosRepository } from '../videos/reel-videos.repository.ts';
import { MockPostsRepository } from './mock-posts.repository.ts';
import { VideoPostsRepository } from './video-posts.repository.ts';

class FakeVideos extends ReelVideosRepository {
  readonly portrait = vi.fn(async (count: number) => Array.from({ length: count }, (_, i) => `https://v.example/${i}.mp4`));
}

test('gives every reel a video and leaves the photos alone', async () => {
  const feed = await new VideoPostsRepository(new MockPostsRepository(), new FakeVideos()).feed();

  expect(feed.filter((p) => p.kind === 'reel').every((p) => p.videoUrl?.endsWith('.mp4'))).toBe(true);
  expect(feed.filter((p) => p.kind === 'photo').every((p) => p.videoUrl === undefined)).toBe(true);
});

test('asks once, for exactly as many videos as there are reels', async () => {
  const videos = new FakeVideos();
  const inner = new MockPostsRepository();
  const reels = (await inner.feed()).filter((p) => p.kind === 'reel').length;

  await new VideoPostsRepository(inner, videos).feed();

  expect(videos.portrait).toHaveBeenCalledOnce();
  expect(videos.portrait).toHaveBeenCalledWith(reels);
});

test('a reload keeps each reel\'s video and asks for no more', async () => {
  const videos = new FakeVideos();
  const repo = new VideoPostsRepository(new MockPostsRepository(), videos);

  const first = await repo.feed();
  const second = await repo.feed();

  expect(second.map((p) => p.videoUrl)).toEqual(first.map((p) => p.videoUrl));
  expect(videos.portrait).toHaveBeenCalledOnce();
});

test('with no videos available the feed is served as it is', async () => {
  const videos = new FakeVideos();
  videos.portrait.mockResolvedValue([]);

  const feed = await new VideoPostsRepository(new MockPostsRepository(), videos).feed();

  expect(feed.every((p) => p.videoUrl === undefined)).toBe(true);
});
