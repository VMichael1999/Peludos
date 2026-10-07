import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { expect, test } from 'vitest';
import { PIXABAY_API_KEY } from '../../core/config.ts';
import { PixabayPhotosRepository, parsePixabayPhotos } from './pixabay-photos.repository.ts';

function repoWith(get: (url: string) => Observable<unknown>, key = 'k') {
  return Injector.create({
    providers: [
      { provide: HttpClient, useValue: { get } },
      { provide: PIXABAY_API_KEY, useValue: key },
      { provide: PixabayPhotosRepository, useClass: PixabayPhotosRepository },
    ],
  }).get(PixabayPhotosRepository);
}

const hit = (n: number, extra = {}) => ({ webformatURL: `https://p.example/${n}.jpg`, ...extra });

test('reads the https photo of each hit, and skips low quality ones', () => {
  expect(parsePixabayPhotos({ hits: [hit(1), hit(2, { isLowQuality: true }), { webformatURL: 'http://p.example/3.jpg' }, {}] })).toEqual(['https://p.example/1.jpg']);
});

test('anything that is not a list of hits yields none', () => {
  expect(parsePixabayPhotos(null)).toEqual([]);
  expect(parsePixabayPhotos({ hits: 'x' })).toEqual([]);
});

test('asks for the species, and answers with at most the photos wanted', async () => {
  let asked = '';
  const repo = repoWith((url) => (asked = url, of({ hits: [hit(1), hit(2), hit(3), hit(4)] })));

  const photos = await repo.photos('cat', 3);

  expect(asked).toContain('q=cat');
  expect(asked).toContain('category=animals');
  expect(asked).toContain('per_page=3');
  expect(photos).toHaveLength(3);
});

test('is best-effort: no key, a failure or nothing wanted all answer with no photos', async () => {
  expect(await repoWith(() => throwError(() => new Error('x'))).photos('dog', 5)).toEqual([]);
  expect(await repoWith(() => { throw new Error('not asked'); }, '').photos('dog', 5)).toEqual([]);
  expect(await repoWith(() => { throw new Error('not asked'); }).photos('dog', 0)).toEqual([]);
});
