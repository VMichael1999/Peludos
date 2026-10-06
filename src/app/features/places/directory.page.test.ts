import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { DirectoryPage } from './directory.page.ts';

test('lists the nearest places and narrows to vets when "Veterinarias" is chosen', async () => {
  const user = userEvent.setup();
  await render(DirectoryPage, { providers: appProviders });

  expect(await screen.findByText('Huellitas Pet Shop')).toBeTruthy();
  expect(screen.getByText('8 a menos de 3 km')).toBeTruthy();

  await user.press(screen.getByRole('button', { name: 'Veterinarias' }));

  expect(await screen.findByText('5 a menos de 3 km')).toBeTruthy();
  expect(screen.getByText('Veterinaria San Roque')).toBeTruthy();
  expect(screen.queryByText('Huellitas Pet Shop')).toBeNull();
  expect(screen.getByText('Veterinarias cerca')).toBeTruthy();
});

test('"Abierto ahora" hides what is closed', async () => {
  const user = userEvent.setup();
  await render(DirectoryPage, { providers: appProviders });
  expect(await screen.findByText('Vet Central')).toBeTruthy();

  await user.press(screen.getByRole('button', { name: 'Abierto ahora' }));

  await screen.findByText('7 a menos de 3 km');
  expect(screen.queryByText('Vet Central')).toBeNull();
});

test('the list keeps every place even though the map draws only the nearest few', async () => {
  await render(DirectoryPage, { providers: appProviders });

  expect(await screen.findAllByRole('button', { name: /^Cómo llegar a/ })).toHaveLength(8);
});
