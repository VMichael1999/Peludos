import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { PALETTE, type Palette } from './palette.ts';

const css = readFileSync(new URL('../../app.ts', import.meta.url), 'utf8');

/** The `light-dark(a, b)` pair declared for a token in app.ts. */
function tokenPair(token: string): [string, string] {
  const match = css.match(new RegExp(`--color-${token}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`, 'i'));
  if (!match) throw new Error(`--color-${token} is not a light-dark() pair in app.ts`);
  return [match[1]!.toLowerCase(), match[2]!.toLowerCase()];
}

const TOKENS: Record<keyof Palette, string> = {
  bg: 'bg', surface: 'surface', surface2: 'surface-2', primary: 'primary', onPrimary: 'on-primary',
  primaryContainer: 'primary-container', accent: 'accent', onAccent: 'on-accent', text: 'text',
  textMuted: 'text-muted', border: 'border', danger: 'danger', success: 'success',
};

test.each(Object.entries(TOKENS))('the JS palette matches the CSS token for %s', (key, token) => {
  // on-accent is one colour in both schemes, so it is not a light-dark() pair.
  if (token === 'on-accent') return;
  const [light, dark] = tokenPair(token);
  expect(PALETTE.light[key as keyof Palette].toLowerCase()).toBe(light);
  expect(PALETTE.dark[key as keyof Palette].toLowerCase()).toBe(dark);
});
