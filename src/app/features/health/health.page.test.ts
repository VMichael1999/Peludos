import { render, screen } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { appProviders } from '../../app.providers.ts';
import { HealthPage } from './health.page.ts';

test('puts the next vaccine first, then the card and the weight', async () => {
  await render(HealthPage, { providers: appProviders, inputs: { id: 'canela' } });

  expect(await screen.findByText('Antirrábica · en 12 días')).toBeTruthy();
  expect(screen.getByText('Salud de Canela')).toBeTruthy();
  expect(screen.getByText('Quíntuple')).toBeTruthy();
  expect(screen.getByText('Por vencer')).toBeTruthy();
  expect(screen.getByText('11,2 kg · +0,4 kg este mes')).toBeTruthy();
});

test('a pet with no card gets an explanation, not a blank screen', async () => {
  await render(HealthPage, { providers: appProviders, inputs: { id: 'nadie' } });

  expect(await screen.findByText('Aún no hay carnet')).toBeTruthy();
});
