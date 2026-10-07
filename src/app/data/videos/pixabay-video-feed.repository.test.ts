import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { expect, test } from 'vitest';
import { PIXABAY_API_KEY } from '../../core/config.ts';
import { PixabayVideoFeedRepository, failureOf, parsePixabay, pickFile, toReelVideo } from './pixabay-video-feed.repository.ts';
import { VideoFeedError } from './video-feed.repository.ts';

function repoWith(get: (url: string) => Observable<unknown>, key = 'secret-key') {
  return Injector.create({
    providers: [
      { provide: HttpClient, useValue: { get } },
      { provide: PIXABAY_API_KEY, useValue: key },
      { provide: PixabayVideoFeedRepository, useClass: PixabayVideoFeedRepository },
    ],
  }).get(PixabayVideoFeedRepository);
}

const file = (width: number, height: number, size = width * height, url = `https://v.example/${width}x${height}.mp4`) => ({ url, width, height, size, thumbnail: `https://t.example/${width}.jpg` });
const videos = { large: file(1920, 1080), medium: file(1280, 720), small: file(960, 540), tiny: file(640, 360) };
const hit = { id: 5631, duration: 12, tags: 'dog, drinking, pet', user: 'Coverr', views: 289149, likes: 721, videos };

test('picks the lightest file that is sharp enough', () => {
  expect(pickFile(videos)?.url).toBe('https://v.example/1280x720.mp4');
});

test('prefers a portrait file over a landscape one', () => {
  expect(pickFile({ ...videos, vertical: file(720, 1280) })?.url).toBe('https://v.example/720x1280.mp4');
});

test('falls back to the sharpest file when none is sharp enough, and skips empty or insecure addresses', () => {
  expect(pickFile({ small: file(960, 540), tiny: file(640, 360) })?.url).toBe('https://v.example/960x540.mp4');
  expect(pickFile({ large: file(1920, 1080, 1, ''), medium: file(1280, 720, 1, 'http://v.example/a.mp4') })).toBeNull();
  expect(pickFile(undefined)).toBeNull();
});

test('turns a hit into the app\'s own video, with its tags split', () => {
  expect(toReelVideo(hit)).toEqual({
    id: '5631', duration: 12, thumbnail: 'https://t.example/1280.jpg', videoUrl: 'https://v.example/1280x720.mp4',
    width: 1280, height: 720, user: 'Coverr', tags: ['dog', 'drinking', 'pet'], views: 289149, likes: 721,
  });
  expect(toReelVideo({ id: 1, videos: {} })).toBeNull();
});

test('says whether there is another page from the total', () => {
  expect(parsePixabay({ hits: [hit], totalHits: 25 }, { page: 1, perPage: 10 }).hasMore).toBe(true);
  expect(parsePixabay({ hits: [hit], totalHits: 25 }, { page: 3, perPage: 10 }).hasMore).toBe(false);
});

test('an answer that is not a list of hits is a service failure', () => {
  expect(() => parsePixabay({ message: 'x' }, { page: 1, perPage: 10 })).toThrow(VideoFeedError);
  expect(() => parsePixabay(null, { page: 1, perPage: 10 })).toThrow(VideoFeedError);
});

test('asks Pixabay for the page and the category, and answers with videos', async () => {
  let asked = '';
  const repo = repoWith((url) => (asked = url, of({ hits: [hit], totalHits: 40 })));

  const page = await repo.getVideos({ query: 'funny animals', category: 'animals', page: 2, perPage: 10 });

  expect(asked).toContain('https://pixabay.com/api/videos/?');
  expect(asked).toContain('q=funny+animals');
  expect(asked).toContain('category=animals');
  expect(asked).toContain('page=2');
  expect(asked).toContain('per_page=10');
  expect(page.items).toHaveLength(1);
});

test('maps failures to a reason, and the error never carries the request or the key', async () => {
  expect(failureOf(new HttpErrorResponse({ status: 0 }))).toBe('network');
  expect(failureOf(new TimeoutError())).toBe('network');
  expect(failureOf(new HttpErrorResponse({ status: 429 }))).toBe('rate-limit');
  expect(failureOf(new HttpErrorResponse({ status: 400 }))).toBe('key');
  expect(failureOf(new HttpErrorResponse({ status: 503 }))).toBe('service');

  const repo = repoWith((url) => throwError(() => new HttpErrorResponse({ status: 429, url })));
  const error = await repo.getVideos({ query: 'dogs', page: 1, perPage: 10 }).catch((e: unknown) => e);

  expect(error).toBeInstanceOf(VideoFeedError);
  expect((error as VideoFeedError).failure).toBe('rate-limit');
  expect(JSON.stringify(error) + (error as Error).message).not.toContain('secret-key');
});

test('without a key it fails as a key failure and asks nothing', async () => {
  const repo = repoWith(() => { throw new Error('should not be called'); }, '');

  await expect(repo.getVideos({ query: 'dogs', page: 1, perPage: 10 })).rejects.toMatchObject({ failure: 'key' });
});
