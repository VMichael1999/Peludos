import { Injector } from '@angular/core';
import { expect, test } from 'vitest';
import type { Species } from '../../domain/models.ts';
import { PetPhotosRepository } from './pet-photos.repository.ts';
import { PetPortraits } from './pet-portraits.ts';

class Fake extends PetPhotosRepository {
  readonly asked: Species[] = [];
  async photos(species: Species, count: number): Promise<string[]> {
    this.asked.push(species);
    return Array.from({ length: count }, (_, i) => `https://p.example/${species}-${i}.jpg`);
  }
}

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const portraitsWith = (source?: PetPhotosRepository) =>
  Injector.create({ providers: [...(source ? [{ provide: PetPhotosRepository, useValue: source }] : []), { provide: PetPortraits, useClass: PetPortraits }] }).get(PetPortraits);

test('has no portrait until the photos arrive, then gives one', async () => {
  const portraits = portraitsWith(new Fake());

  expect(portraits.portrait('Canela', 'dog')).toBeUndefined();
  await settle();

  expect(portraits.portrait('Canela', 'dog')).toMatch(/dog-\d+\.jpg$/);
});

test('a pet keeps its portrait, and two pets get different ones', async () => {
  const portraits = portraitsWith(new Fake());
  portraits.portrait('Canela', 'dog');
  await settle();

  const canela = portraits.portrait('Canela', 'dog');
  const max = portraits.portrait('Max', 'dog');

  expect(portraits.portrait('Canela', 'dog')).toBe(canela);
  expect(max).not.toBe(canela);
});

test('a dog and a cat of the same name are different pets', async () => {
  const portraits = portraitsWith(new Fake());
  portraits.portrait('Luna', 'dog');
  portraits.portrait('Luna', 'cat');
  await settle();

  expect(portraits.portrait('Luna', 'dog')).toMatch(/dog-/);
  expect(portraits.portrait('Luna', 'cat')).toMatch(/cat-/);
});

test('asks each species once, however many pets there are', async () => {
  const source = new Fake();
  const portraits = portraitsWith(source);
  for (const name of ['A', 'B', 'C']) portraits.portrait(name, 'dog');
  await settle();
  for (const name of ['A', 'B', 'C']) portraits.portrait(name, 'dog');

  expect(source.asked).toEqual(['dog']);
});

test('a gallery never contains the pet\'s portrait, and is the same each time', async () => {
  const portraits = portraitsWith(new Fake());
  portraits.portrait('Canela', 'dog');
  await settle();

  const portrait = portraits.portrait('Canela', 'dog');
  const gallery = portraits.gallery('Canela', 'dog', 9);

  expect(gallery).toHaveLength(9);
  expect(new Set(gallery).size).toBe(9);
  expect(gallery).not.toContain(portrait);
  expect(portraits.gallery('Canela', 'dog', 9)).toEqual(gallery);
});

test('a second set of the gallery starts after the first', async () => {
  const portraits = portraitsWith(new Fake());
  portraits.portrait('Canela', 'dog');
  await settle();

  const first = portraits.gallery('Canela', 'dog', 9);
  const second = portraits.gallery('Canela', 'dog', 6, 9);

  expect(second.filter((photo) => first.includes(photo))).toHaveLength(0);
});

test('with no photo source there is nothing to show', () => {
  const portraits = portraitsWith();

  expect(portraits.portrait('Canela', 'dog')).toBeUndefined();
  expect(portraits.gallery('Canela', 'dog', 9)).toEqual([]);
});
