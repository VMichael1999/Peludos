import { expect, test, vi } from 'vitest';
import type { Species } from '../../domain/models.ts';
import { PetPhotosRepository } from '../photos/pet-photos.repository.ts';
import { MockPostsRepository } from './mock-posts.repository.ts';
import { PhotoPostsRepository } from './photo-posts.repository.ts';

/** Photos for dogs and cats alike, each URL naming its species so a test can tell them apart. */
class FakePhotos extends PetPhotosRepository {
  readonly photos = vi.fn(async (species: Species, count: number) =>
    Array.from({ length: count }, (_, i) => `https://photos.example/${species}/${i}.jpg`),
  );
}

test('gives every post a photo of its own species', async () => {
  const repo = new PhotoPostsRepository(new MockPostsRepository(), new FakePhotos());

  const feed = await repo.feed();

  expect(feed.length).toBeGreaterThan(0);
  expect(feed.every((p) => p.photoUrl?.includes(`/${p.species}/`))).toBe(true);
});

test('asks once per species, for exactly as many photos as there are posts of it', async () => {
  const photos = new FakePhotos();
  const inner = new MockPostsRepository();
  const all = await inner.feed();
  const dogs = all.filter((p) => p.species === 'dog').length;
  const cats = all.filter((p) => p.species === 'cat').length;

  await new PhotoPostsRepository(inner, photos).feed();

  expect(photos.photos).toHaveBeenCalledTimes(2);
  expect(photos.photos).toHaveBeenCalledWith('dog', dogs);
  expect(photos.photos).toHaveBeenCalledWith('cat', cats);
});

test('a reload keeps each post\'s photo and asks for no more', async () => {
  const photos = new FakePhotos();
  const repo = new PhotoPostsRepository(new MockPostsRepository(), photos);

  const first = await repo.feed();
  const second = await repo.feed();

  expect(second.map((p) => p.photoUrl)).toEqual(first.map((p) => p.photoUrl));
  expect(photos.photos).toHaveBeenCalledTimes(2);
});

test('a species with no photos keeps its placeholders while the other gets its photos', async () => {
  const photos = new FakePhotos();
  photos.photos.mockImplementation(async (species, count) => (species === 'dog' ? Array.from({ length: count }, (_, i) => `https://photos.example/dog/${i}.jpg`) : []));

  const feed = await new PhotoPostsRepository(new MockPostsRepository(), photos).feed();

  expect(feed.filter((p) => p.species === 'dog').every((p) => p.photoUrl)).toBe(true);
  expect(feed.filter((p) => p.species === 'cat').every((p) => p.photoUrl === undefined)).toBe(true);
});

test('with no photos available the feed is served as it is', async () => {
  const photos = new FakePhotos();
  photos.photos.mockResolvedValue([]);

  const feed = await new PhotoPostsRepository(new MockPostsRepository(), photos).feed();

  expect(feed.length).toBeGreaterThan(0);
  expect(feed.every((p) => p.photoUrl === undefined)).toBe(true);
});

test('everything else goes straight to the wrapped repository', async () => {
  const repo = new PhotoPostsRepository(new MockPostsRepository(), new FakePhotos());

  await repo.setLiked('p1', true);

  expect((await repo.feed()).find((p) => p.id === 'p1')?.liked).toBe(true);
});
