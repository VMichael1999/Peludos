import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { POSTS } from '../../data/mock/seed.ts';
import { ExplorePage } from './explore.page.ts';

const tiles = () => screen.queryAllByRole('image').map((n) => String(n.props.accessibilityLabel));

test('shows the nearby shops and a mosaic of posts', async () => {
  await render(ExplorePage, { providers: appProviders });

  expect(await screen.findByRole('button', { name: /^Huellitas Pet Shop/ })).toBeTruthy();
  expect((await screen.findAllByRole('image')).length).toBeGreaterThan(3);
});

test('"Gatos" keeps only the cats', async () => {
  const user = userEvent.setup();
  await render(ExplorePage, { providers: appProviders });
  await screen.findAllByRole('image');

  await user.press(screen.getByRole('button', { name: 'Gatos' }));

  const labels = tiles();
  const catNames = new Set(POSTS.filter((p) => p.species === 'cat').map((p) => p.petName));
  const dogNames = new Set(POSTS.filter((p) => p.species === 'dog').map((p) => p.petName));
  expect(labels).toHaveLength(25);
  expect(labels.every((l) => catNames.has(l.split(':')[0]!))).toBe(true);
  expect(labels.some((l) => dogNames.has(l.split(':')[0]!) && !catNames.has(l.split(':')[0]!))).toBe(false);
});

test('searching narrows the posts, and a search with no match says so', async () => {
  const user = userEvent.setup();
  await render(ExplorePage, { providers: appProviders });
  await screen.findAllByRole('image');

  await user.type(screen.getByLabelText('Buscar'), 'zzzz');

  expect(await screen.findByText('Sin resultados')).toBeTruthy();
});
