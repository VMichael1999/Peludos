import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { StoryPage } from './story.page.ts';

// The tests run with no photo or video source, so a story with no posts to show is empty.

test('opens the story of the pet, with its name', async () => {
  await render(StoryPage, { inputs: { id: 's1' }, providers: appProviders });

  expect(await screen.findByText('Canela')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Cerrar historia' })).toBeTruthy();
});

test('a story with nothing to show says so, and can be closed', async () => {
  const user = userEvent.setup();
  await render(StoryPage, { inputs: { id: 's1' }, providers: appProviders });

  expect(await screen.findByText('Esta historia aún no tiene momentos.')).toBeTruthy();
  await user.press(screen.getByRole('button', { name: 'Cerrar historia' }));
});
