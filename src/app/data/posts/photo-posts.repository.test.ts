import { expect, test, vi } from 'vitest';
import { PetPhotosRepository } from '../photos/pet-photos.repository.ts';
import { MockPostsRepository } from './mock-posts.repository.ts';
import { PhotoPostsRepository } from './photo-posts.repository.ts';

class FakePhotos extends PetPhotosRepository {
  readonly dogs = vi.fn(async (count: number) => Array.from({ length: count }, (_, i) => `https://images.dog.ceo/${i}.jpg`));
}

test('gives every dog post a photo and leaves the cats alone', async () => {
  const repo = new PhotoPostsRepository(new MockPostsRepository(), new FakePhotos());

  const feed = await repo.feed();

  expect(feed.filter((p) => p.species === 'dog').every((p) => p.photoUrl?.startsWith('https://'))).toBe(true);
  expect(feed.filter((p) => p.species === 'cat').every((p) => p.photoUrl === undefined)).toBe(true);
});

test('asks for exactly as many photos as there are dog posts', async () => {
  const photos = new FakePhotos();
  const inner = new MockPostsRepository();
  const dogs = (await inner.feed()).filter((p) => p.species === 'dog').length;

  await new PhotoPostsRepository(inner, photos).feed();

  expect(photos.dogs).toHaveBeenCalledWith(dogs);
});

test('a reload keeps each post\'s photo and asks for no more', async () => {
  const photos = new FakePhotos();
  const repo = new PhotoPostsRepository(new MockPostsRepository(), photos);

  const first = await repo.feed();
  const second = await repo.feed();

  expect(second.map((p) => p.photoUrl)).toEqual(first.map((p) => p.photoUrl));
  expect(photos.dogs).toHaveBeenCalledTimes(1);
});

test('with no photos available the feed is served as it is', async () => {
  const photos = new FakePhotos();
  photos.dogs.mockResolvedValue([]);

  const feed = await new PhotoPostsRepository(new MockPostsRepository(), photos).feed();

  expect(feed.length).toBeGreaterThan(0);
  expect(feed.every((p) => p.photoUrl === undefined)).toBe(true);
});

test('everything else goes straight to the wrapped repository', async () => {
  const repo = new PhotoPostsRepository(new MockPostsRepository(), new FakePhotos());

  await repo.setLiked('p1', true);

  expect((await repo.feed()).find((p) => p.id === 'p1')?.liked).toBe(true);
});
