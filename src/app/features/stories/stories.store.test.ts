import { Injector } from '@angular/core';
import { expect, test } from 'vitest';
import { StoriesStore } from './stories.store.ts';

const store = () => Injector.create({ providers: [{ provide: StoriesStore, useClass: StoriesStore }] }).get(StoriesStore);

test('a story is unseen until it is watched, and stays seen', () => {
  const stories = store();
  expect(stories.seen('s1')).toBe(false);

  stories.markSeen('s1');
  stories.markSeen('s1');

  expect(stories.seen('s1')).toBe(true);
  expect(stories.seen('s2')).toBe(false);
});
