import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { AppearancePage } from './appearance.page.ts';

test('marks the chosen theme', async () => {
  const user = userEvent.setup();
  await render(AppearancePage, { providers: appProviders });

  await user.press(screen.getByRole('radio', { name: 'Oscuro' }));

  expect(screen.getByRole('radio', { name: 'Oscuro' }).props.accessibilityState).toMatchObject({ selected: true });
  expect(screen.getByRole('radio', { name: 'Claro' }).props.accessibilityState).toMatchObject({ selected: false });
});
