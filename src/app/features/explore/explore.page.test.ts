import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
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
  expect(labels.length).toBeGreaterThan(0);
  expect(labels.every((l) => /^(Luna|Nala|Milo):/.test(l))).toBe(true);
});

test('searching narrows the posts, and a search with no match says so', async () => {
  const user = userEvent.setup();
  await render(ExplorePage, { providers: appProviders });
  await screen.findAllByRole('image');

  await user.type(screen.getByLabelText('Buscar'), 'zzzz');

  expect(await screen.findByText('Sin resultados')).toBeTruthy();
});
