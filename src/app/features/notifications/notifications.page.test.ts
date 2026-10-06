import { render, screen } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { NotificationsPage } from './notifications.page.ts';

test('groups what is new apart from what is older', async () => {
  await render(NotificationsPage, { providers: appProviders });

  expect(await screen.findByText('Nuevas')).toBeTruthy();
  expect(screen.getByText('Anteriores')).toBeTruthy();
  expect(screen.getByRole('button', { name: /^Valeria empezó a seguir a Canela/ })).toBeTruthy();
});

test('a lost-pet alert comes before a like, even though the like is newer', async () => {
  await render(NotificationsPage, { providers: appProviders });
  await screen.findByText('Nuevas');

  const labels = screen.getAllByRole('button').map((b) => String(b.props.accessibilityLabel));
  const alert = labels.findIndex((l) => l.startsWith('Toby'));
  const like = labels.findIndex((l) => l.startsWith('Marco'));
  expect(alert).toBeGreaterThanOrEqual(0);
  expect(alert).toBeLessThan(like);
});
