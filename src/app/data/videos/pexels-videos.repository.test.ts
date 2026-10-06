import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { expect, test, vi } from 'vitest';
import { PEXELS_API_KEY } from '../../core/config.ts';
import { PexelsVideosRepository, parsePexels, pickFile } from './pexels-videos.repository.ts';

function repoWith(get: (url: string, options?: unknown) => Observable<unknown>, key = 'k') {
  return Injector.create({
    providers: [
      { provide: HttpClient, useValue: { get } },
      { provide: PEXELS_API_KEY, useValue: key },
      { provide: PexelsVideosRepository, useClass: PexelsVideosRepository },
    ],
  }).get(PexelsVideosRepository);
}

const file = (width: number, height: number, link = `https://v.example/${width}x${height}.mp4`, file_type = 'video/mp4') => ({ width, height, link, file_type });

test('picks the portrait mp4 closest to 720 wide', () => {
  expect(pickFile({ video_files: [file(360, 640), file(720, 1280), file(1080, 1920)] })).toBe('https://v.example/720x1280.mp4');
});

test('ignores landscape files, other formats and insecure links', () => {
  expect(pickFile({ video_files: [file(1280, 720), file(720, 1280, 'https://v.example/a.webm', 'video/webm'), file(720, 1280, 'http://v.example/b.mp4')] })).toBeNull();
  expect(pickFile({})).toBeNull();
});

test('reads one video URL per Pexels video and skips the ones with no usable file', () => {
  const answer = { videos: [{ video_files: [file(720, 1280)] }, { video_files: [file(1280, 720)] }, { video_files: [file(540, 960)] }] };
  expect(parsePexels(answer)).toEqual(['https://v.example/720x1280.mp4', 'https://v.example/540x960.mp4']);
  expect(parsePexels(null)).toEqual([]);
  expect(parsePexels({ videos: 'no' })).toEqual([]);
});

test('without a key it asks for nothing', async () => {
  const get = vi.fn(() => of({}));
  expect(await repoWith(get, '').portrait(5)).toEqual([]);
  expect(get).not.toHaveBeenCalled();
});

test('asks for portrait videos with the key in the Authorization header, capped at forty', async () => {
  const get = vi.fn((_url: string, _options?: unknown) => of({ videos: [] }));

  await repoWith(get, 'secret').portrait(500);

  const [url, options] = get.mock.calls[0]!;
  expect(url).toContain('orientation=portrait');
  expect(url).toContain('per_page=40');
  expect(options).toEqual({ headers: { Authorization: 'secret' } });
  expect(url).not.toContain('secret');
});

test('a failure, such as a rate limit, is no videos and not an error', async () => {
  expect(await repoWith(() => throwError(() => new Error('429'))).portrait(3)).toEqual([]);
});
