import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { expect, test, vi } from 'vitest';
import { CatApiPhotosRepository, parseCatApi } from './cat-api-photos.repository.ts';

function repoWith(get: (url: string) => Observable<unknown>) {
  const injector = Injector.create({
    providers: [
      { provide: HttpClient, useValue: { get } },
      { provide: CatApiPhotosRepository, useClass: CatApiPhotosRepository },
    ],
  });
  return injector.get(CatApiPhotosRepository);
}

test('reads the photo URLs out of the answer', () => {
  expect(parseCatApi([{ id: 'a', url: 'https://cdn2.thecatapi.com/images/a.jpg', width: 500 }, { id: 'b', url: 'https://cdn2.thecatapi.com/images/b.png' }])).toEqual([
    'https://cdn2.thecatapi.com/images/a.jpg',
    'https://cdn2.thecatapi.com/images/b.png',
  ]);
});

test('anything unexpected yields no photos', () => {
  expect(parseCatApi(null)).toEqual([]);
  expect(parseCatApi({ message: 'error' })).toEqual([]);
  expect(parseCatApi([null, 7, { id: 'x' }, { url: 42 }])).toEqual([]);
});

test('drops anything that is not an https URL', () => {
  expect(parseCatApi([{ url: 'http://insecure/a.jpg' }, { url: 'https://cdn2.thecatapi.com/ok.jpg' }])).toEqual(['https://cdn2.thecatapi.com/ok.jpg']);
});

test('asks for as many photos as wanted, never more than it can give, and only JPEG or PNG', async () => {
  const get = vi.fn(() => of([]));
  const repo = repoWith(get);

  await repo.photos('cat', 4);
  await repo.photos('cat', 500);

  expect(get).toHaveBeenNthCalledWith(1, 'https://api.thecatapi.com/v1/images/search?limit=4&mime_types=jpg,png');
  expect(get).toHaveBeenNthCalledWith(2, 'https://api.thecatapi.com/v1/images/search?limit=10&mime_types=jpg,png');
});

test('it has no dogs, and does not even ask', async () => {
  const get = vi.fn(() => of([{ url: 'https://cdn2.thecatapi.com/a.jpg' }]));

  expect(await repoWith(get).photos('dog', 3)).toEqual([]);
  expect(get).not.toHaveBeenCalled();
});

test('asks for nothing when no photo is wanted', async () => {
  const get = vi.fn(() => of([]));
  expect(await repoWith(get).photos('cat', 0)).toEqual([]);
  expect(get).not.toHaveBeenCalled();
});

test('a network failure is no photos, not an error', async () => {
  expect(await repoWith(() => throwError(() => new Error('offline'))).photos('cat', 3)).toEqual([]);
});
