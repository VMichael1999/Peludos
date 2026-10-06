import { expect, test, vi } from 'vitest';
import type { Species } from '../../domain/models.ts';
import { ChainPetPhotosRepository } from './chain-pet-photos.repository.ts';
import { PetPhotosRepository } from './pet-photos.repository.ts';

/** A source with photos for the species it knows and nothing for the rest. */
class Only extends PetPhotosRepository {
  readonly photos = vi.fn(async (species: Species, count: number) =>
    species === this.species ? Array.from({ length: count }, (_, i) => `https://${this.species}.example/${i}.jpg`) : [],
  );
  constructor(private readonly species: Species) {
    super();
  }
}

test('each species is answered by the source that has it', async () => {
  const chain = new ChainPetPhotosRepository([new Only('dog'), new Only('cat')]);

  expect(await chain.photos('dog', 2)).toEqual(['https://dog.example/0.jpg', 'https://dog.example/1.jpg']);
  expect(await chain.photos('cat', 1)).toEqual(['https://cat.example/0.jpg']);
});

test('once a source answers, the ones after it are not asked', async () => {
  const dogs = new Only('dog');
  const cats = new Only('cat');

  await new ChainPetPhotosRepository([dogs, cats]).photos('dog', 3);

  expect(dogs.photos).toHaveBeenCalledTimes(1);
  expect(cats.photos).not.toHaveBeenCalled();
});

test('a source with nothing hands over to the next', async () => {
  const empty = new Only('cat');
  const dogs = new Only('dog');

  const urls = await new ChainPetPhotosRepository([empty, dogs]).photos('dog', 1);

  expect(urls).toEqual(['https://dog.example/0.jpg']);
  expect(empty.photos).toHaveBeenCalledTimes(1);
});

test('no source having the species is no photos, not an error', async () => {
  expect(await new ChainPetPhotosRepository([new Only('dog')]).photos('cat', 2)).toEqual([]);
  expect(await new ChainPetPhotosRepository([]).photos('dog', 2)).toEqual([]);
});
