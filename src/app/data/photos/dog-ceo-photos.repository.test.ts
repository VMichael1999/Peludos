import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { expect, test, vi } from 'vitest';
import { DogCeoPhotosRepository, parseDogCeo } from './dog-ceo-photos.repository.ts';

function repoWith(get: (url: string) => Observable<unknown>) {
  const injector = Injector.create({
    providers: [
      { provide: HttpClient, useValue: { get } },
      { provide: DogCeoPhotosRepository, useClass: DogCeoPhotosRepository },
    ],
  });
  return injector.get(DogCeoPhotosRepository);
}

test('reads the photo URLs out of a successful answer', () => {
  expect(parseDogCeo({ status: 'success', message: ['https://images.dog.ceo/a.jpg', 'https://images.dog.ceo/b.jpg'] })).toEqual([
    'https://images.dog.ceo/a.jpg',
    'https://images.dog.ceo/b.jpg',
  ]);
});

test('anything unexpected yields no photos', () => {
  expect(parseDogCeo(null)).toEqual([]);
  expect(parseDogCeo({ status: 'error', message: 'No such breed' })).toEqual([]);
  expect(parseDogCeo({ status: 'success', message: 'https://images.dog.ceo/a.jpg' })).toEqual([]);
});

test('drops anything that is not an https URL', () => {
  expect(parseDogCeo({ status: 'success', message: ['http://insecure/a.jpg', 42, 'https://images.dog.ceo/ok.jpg'] })).toEqual([
    'https://images.dog.ceo/ok.jpg',
  ]);
});

test('asks for as many photos as wanted, never more than the API gives', async () => {
  const get = vi.fn(() => of({ status: 'success', message: [] }));
  const repo = repoWith(get);

  await repo.dogs(3);
  await repo.dogs(500);

  expect(get).toHaveBeenNthCalledWith(1, 'https://dog.ceo/api/breeds/image/random/3');
  expect(get).toHaveBeenNthCalledWith(2, 'https://dog.ceo/api/breeds/image/random/50');
});

test('asks for nothing when no photo is wanted', async () => {
  const get = vi.fn(() => of({}));
  expect(await repoWith(get).dogs(0)).toEqual([]);
  expect(get).not.toHaveBeenCalled();
});

test('a network failure is no photos, not an error', async () => {
  const repo = repoWith(() => throwError(() => new Error('offline')));
  expect(await repo.dogs(5)).toEqual([]);
});
