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

test('asks for as many photos as wanted, in one request when it fits', async () => {
  const get = vi.fn(() => of([]));

  await repoWith(get).photos('cat', 4);

  expect(get).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('https://api.thecatapi.com/v1/images/search?limit=4&mime_types=jpg,png');
});

test('a long list is asked for in batches of ten, with the rest in the last one', async () => {
  const get = vi.fn((_url: string) => of([]));

  await repoWith(get).photos('cat', 25);

  expect(get.mock.calls.map(([url]) => url)).toEqual([
    'https://api.thecatapi.com/v1/images/search?limit=10&mime_types=jpg,png',
    'https://api.thecatapi.com/v1/images/search?limit=10&mime_types=jpg,png',
    'https://api.thecatapi.com/v1/images/search?limit=5&mime_types=jpg,png',
  ]);
});

test('never asks for more than fifty in one call', async () => {
  const get = vi.fn(() => of([]));

  await repoWith(get).photos('cat', 500);

  expect(get).toHaveBeenCalledTimes(5);
});

test('joins the batches, and keeps a photo that came twice once', async () => {
  let call = 0;
  const get = vi.fn(() => of(call++ === 0 ? [{ url: 'https://c.example/a.jpg' }, { url: 'https://c.example/b.jpg' }] : [{ url: 'https://c.example/b.jpg' }, { url: 'https://c.example/c.jpg' }]));

  expect(await repoWith(get).photos('cat', 12)).toEqual(['https://c.example/a.jpg', 'https://c.example/b.jpg', 'https://c.example/c.jpg']);
});

test('never returns more than were asked for', async () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ url: `https://c.example/${i}.jpg` }));

  expect(await repoWith(() => of(many)).photos('cat', 3)).toHaveLength(3);
});

test('a failed batch does not take the others with it', async () => {
  let call = 0;
  const get = vi.fn(() => (call++ === 0 ? throwError(() => new Error('rate limited')) : of([{ url: 'https://c.example/ok.jpg' }])));

  expect(await repoWith(get).photos('cat', 15)).toEqual(['https://c.example/ok.jpg']);
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
