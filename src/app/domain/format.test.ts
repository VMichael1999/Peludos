import { expect, test } from 'vitest';
import { ago, compact, distance, price } from './format.ts';

test('ago says how long ago the way a person would', () => {
  expect(ago(0)).toBe('ahora');
  expect(ago(25)).toBe('hace 25 min');
  expect(ago(180)).toBe('hace 3 h');
  expect(ago(1500)).toBe('ayer');
  expect(ago(4320)).toBe('hace 3 días');
});

test('distance switches from metres to kilometres at one kilometre', () => {
  expect(distance(0.6)).toBe('600 m');
  expect(distance(1.2)).toBe('1,2 km');
});

test('price and compact use a decimal comma', () => {
  expect(price(48.9)).toBe('48,90');
  expect(compact(128)).toBe('128');
  expect(compact(2400)).toBe('2,4 mil');
});
