import { expect, test } from 'vitest';
import { MockPostsRepository } from './mock-posts.repository.ts';

test('a published post goes to the top of the feed, with no likes yet', async () => {
  const repo = new MockPostsRepository();

  const post = await repo.publish({ petName: 'Canela', species: 'dog', ownerName: 'Lucía', caption: 'Hola', kind: 'photo' });

  const feed = await repo.feed();
  expect(feed[0]?.id).toBe(post.id);
  expect(post.likes).toBe(0);
});

test('liking updates the count, and un-liking takes it back', async () => {
  const repo = new MockPostsRepository();
  const before = (await repo.feed()).find((p) => p.id === 'p1')!;

  await repo.setLiked('p1', true);
  expect((await repo.feed()).find((p) => p.id === 'p1')!.likes).toBe(before.likes + 1);

  await repo.setLiked('p1', false);
  expect((await repo.feed()).find((p) => p.id === 'p1')!.likes).toBe(before.likes);
});
