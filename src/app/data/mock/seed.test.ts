import { expect, test, vi } from 'vitest';
import { GENERATED_POSTS } from './generated-posts.ts';
import { POSTS } from './seed.ts';

test('the sample feed has 25 dogs and 25 cats', () => {
  expect(POSTS.filter((p) => p.species === 'dog')).toHaveLength(25);
  expect(POSTS.filter((p) => p.species === 'cat')).toHaveLength(25);
});

test('every post has its own id', () => {
  expect(new Set(POSTS.map((p) => p.id)).size).toBe(POSTS.length);
});

test('the feed runs from newest to oldest', () => {
  const ages = POSTS.map((p) => p.minutesAgo);
  expect(ages).toEqual([...ages].sort((a, b) => a - b));
  expect(POSTS[0]?.id).toBe('p1');
});

test('there are enough reels to scroll through, and enough photos for the feed', () => {
  expect(POSTS.filter((p) => p.kind === 'reel').length).toBeGreaterThanOrEqual(8);
  expect(POSTS.filter((p) => p.kind === 'photo').length).toBeGreaterThanOrEqual(30);
});

test('the numbers are believable: no negative counts, and never more comments than likes', () => {
  expect(POSTS.every((p) => p.likes >= 0 && p.comments >= 0 && p.comments <= p.likes)).toBe(true);
});

test('the generated posts are the same on every run', async () => {
  vi.resetModules();
  const again = (await import('./generated-posts.ts')).GENERATED_POSTS;

  expect(again).toEqual(GENERATED_POSTS);
  expect(GENERATED_POSTS).toHaveLength(41);
});
