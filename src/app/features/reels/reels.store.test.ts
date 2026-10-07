import { Injector } from '@angular/core';
import { expect, test } from 'vitest';
import type { ReelVideo } from '../../domain/models.ts';
import { VideoFeedError, VideoFeedRepository, type VideoPage, type VideoQuery } from '../../data/videos/video-feed.repository.ts';
import { REEL_CATEGORIES, ReelsStore, failureMessage } from './reels.store.ts';

const video = (id: string): ReelVideo => ({ id, duration: 10, thumbnail: '', videoUrl: `https://v.example/${id}.mp4`, width: 1280, height: 720, user: 'u', tags: ['dog'], views: 1, likes: 1 });

class FakeFeed extends VideoFeedRepository {
  readonly asked: VideoQuery[] = [];
  answers: Array<VideoPage | VideoFeedError> = [];
  hold: Promise<void> | null = null;
  async getVideos(query: VideoQuery): Promise<VideoPage> {
    this.asked.push(query);
    if (this.hold) await this.hold;
    const answer = this.answers.shift() ?? { items: [], hasMore: false };
    if (answer instanceof VideoFeedError) throw answer;
    return answer;
  }
}

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function storeWith(feed: FakeFeed) {
  return Injector.create({ providers: [{ provide: VideoFeedRepository, useValue: feed }, { provide: ReelsStore, useClass: ReelsStore }] }).get(ReelsStore);
}

test('loads the first page of the first category', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [video('1'), video('2')], hasMore: true }];
  const store = storeWith(feed);
  await settle();

  expect(store.status()).toBe('ready');
  expect(store.reels().map((r) => r.id)).toEqual(['1', '2']);
  expect(feed.asked[0]).toEqual({ query: 'dogs', category: 'animals', page: 1, perPage: 10 });
});

test('no videos at all is the empty state', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [], hasMore: false }];
  const store = storeWith(feed);
  await settle();

  expect(store.status()).toBe('empty');
});

test('a failed first page is the error state, and retrying loads it', async () => {
  const feed = new FakeFeed();
  feed.answers = [new VideoFeedError('network'), { items: [video('1')], hasMore: false }];
  const store = storeWith(feed);
  await settle();
  expect(store.status()).toBe('error');
  expect(store.message()).toBe(failureMessage('network'));

  await store.reload();

  expect(store.status()).toBe('ready');
});

test('loads the next page once, however many times it is asked for', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [video('1')], hasMore: true }, { items: [video('2')], hasMore: false }];
  const store = storeWith(feed);
  await settle();

  let release!: () => void;
  feed.hold = new Promise<void>((resolve) => (release = resolve));
  void store.loadMore();
  void store.loadMore();
  void store.loadMore();
  expect(store.loadingMore()).toBe(true);
  release();
  await settle();

  expect(feed.asked.map((q) => q.page)).toEqual([1, 2]);
  expect(store.reels().map((r) => r.id)).toEqual(['1', '2']);
  expect(store.hasMore()).toBe(false);
});

test('asks for nothing more once the results are over', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [video('1')], hasMore: false }];
  const store = storeWith(feed);
  await settle();

  await store.loadMore();

  expect(feed.asked).toHaveLength(1);
});

test('a failed next page keeps the videos and can be retried', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [video('1')], hasMore: true }, new VideoFeedError('service'), { items: [video('2')], hasMore: false }];
  const store = storeWith(feed);
  await settle();

  await store.loadMore();
  expect(store.moreFailed()).toBe(true);
  expect(store.reels()).toHaveLength(1);
  expect(store.status()).toBe('ready');

  await store.loadMore();
  expect(store.moreFailed()).toBe(false);
  expect(store.reels().map((r) => r.id)).toEqual(['1', '2']);
});

test('a video that comes twice is shown once', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [video('1')], hasMore: true }, { items: [video('1'), video('2')], hasMore: false }];
  const store = storeWith(feed);
  await settle();

  await store.loadMore();

  expect(store.reels().map((r) => r.id)).toEqual(['1', '2']);
});

test('choosing a category starts the feed over with that search', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [video('1')], hasMore: true }, { items: [video('9')], hasMore: false }];
  const store = storeWith(feed);
  await settle();

  store.select(REEL_CATEGORIES.find((c) => c.id === 'cats')!);
  await settle();

  expect(feed.asked[1]).toMatchObject({ query: 'cats', page: 1 });
  expect(store.reels().map((r) => r.id)).toEqual(['9']);
});

test('an answer to a category the person has left is thrown away', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [video('1')], hasMore: false }];
  const store = storeWith(feed);
  await settle();

  let release!: () => void;
  feed.hold = new Promise<void>((resolve) => (release = resolve));
  feed.answers = [{ items: [video('late')], hasMore: false }, { items: [video('cat')], hasMore: false }];
  store.select(REEL_CATEGORIES[1]);
  store.select(REEL_CATEGORIES[2]);
  release();
  await settle();

  expect(store.reels().map((r) => r.id)).toEqual(['cat']);
});

test('likes, saves and sound outlive a change of category', async () => {
  const feed = new FakeFeed();
  feed.answers = [{ items: [video('1')], hasMore: false }, { items: [video('2')], hasMore: false }];
  const store = storeWith(feed);
  await settle();

  store.toggleLike(store.reels()[0]);
  store.toggleMuted();
  expect(store.reels()[0].liked).toBe(true);
  store.select(REEL_CATEGORIES[1]);
  await settle();

  expect(store.muted()).toBe(true);
  store.toggleLike(store.reels()[0]);
  store.toggleLike(store.reels()[0]);
  expect(store.reels()[0].liked).toBe(false);
});

test('failures are said in plain words', () => {
  for (const failure of ['network', 'key', 'rate-limit', 'service', null] as const) {
    expect(failureMessage(failure)).not.toMatch(/key|http|error|429|400/i);
  }
});
