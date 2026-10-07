import { render, screen } from '@ng-native/testing';
import { expect, test } from 'vitest';
import type { Species } from '../../domain/models.ts';
import { PetPhotosRepository } from '../../data/photos/pet-photos.repository.ts';
import { AppAvatar } from './app-avatar.ts';

class Photos extends PetPhotosRepository {
  async photos(_species: Species, count: number): Promise<string[]> {
    return Array.from({ length: count }, (_, i) => `https://p.example/${i}.jpg`);
  }
}

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

test('a person or a place is shown as an initial', async () => {
  await render(AppAvatar, { inputs: { name: 'Huellitas' } });

  expect(screen.getByText('H')).toBeTruthy();
});

test('a pet shows its portrait once photos arrive', async () => {
  await render(AppAvatar, { inputs: { name: 'Canela', species: 'dog' }, providers: [{ provide: PetPhotosRepository, useClass: Photos }] });
  await settle();

  expect(screen.getByLabelText('Canela')).toBeTruthy();
});

test('a pet with no photo source keeps its initial', async () => {
  await render(AppAvatar, { inputs: { name: 'Canela', species: 'dog' } });
  await settle();

  expect(screen.getByText('C')).toBeTruthy();
});
