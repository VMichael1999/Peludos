import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { CreatePostPage } from './create-post.page.ts';

test('offers the user\'s pets and starts as a photo', async () => {
  await render(CreatePostPage, { providers: appProviders });

  expect(await screen.findByRole('radio', { name: 'Canela' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Foto' }).props.accessibilityState).toMatchObject({ selected: true });
});

test('switching to Reel marks it as the chosen kind', async () => {
  const user = userEvent.setup();
  await render(CreatePostPage, { providers: appProviders });

  await user.press(screen.getByRole('button', { name: 'Reel' }));

  expect(screen.getByRole('button', { name: 'Reel' }).props.accessibilityState).toMatchObject({ selected: true });
  expect(screen.getByRole('button', { name: 'Foto' }).props.accessibilityState).toMatchObject({ selected: false });
});
