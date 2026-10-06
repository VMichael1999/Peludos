import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { ProfilePage } from './profile.page.ts';

test('shows the first pet, and switches to the other one', async () => {
  const user = userEvent.setup();
  await render(ProfilePage, { providers: appProviders });

  expect(await screen.findByText('Beagle · 3 años · de Lucía')).toBeTruthy();
  expect(screen.getByText('1,2 mil')).toBeTruthy();

  await user.press(screen.getByRole('tab', { name: 'Milo' }));

  expect(await screen.findByText('Gato europeo · 5 años · de Lucía')).toBeTruthy();
});

test('the health tab leads to the pet\'s health card', async () => {
  const user = userEvent.setup();
  await render(ProfilePage, { providers: appProviders });
  await screen.findByText('Beagle · 3 años · de Lucía');

  await user.press(screen.getByRole('tab', { name: 'Salud' }));

  expect(screen.getByRole('button', { name: 'Abrir carnet de salud' })).toBeTruthy();
});
