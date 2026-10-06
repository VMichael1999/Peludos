import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { ReportAlertPage } from './report-alert.page.ts';

test('refuses an empty report and says what to fix', async () => {
  const user = userEvent.setup();
  await render(ReportAlertPage, { providers: appProviders });
  await screen.findByRole('radio', { name: 'Canela' });

  await user.press(screen.getByRole('button', { name: 'Publicar alerta' }));

  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.getByText('Completa los campos marcados en rojo.')).toBeTruthy();
});

test('offers the user\'s pets and selects the first by default', async () => {
  await render(ReportAlertPage, { providers: appProviders });

  expect(await screen.findByRole('radio', { name: 'Canela' })).toBeTruthy();
  expect(screen.getByRole('radio', { name: 'Milo' })).toBeTruthy();
});
