import { expect, test } from 'vitest';
import { MockAlertsRepository } from './mock-alerts.repository.ts';

test('a reported pet shows up first among the lost ones', async () => {
  const repo = new MockAlertsRepository();
  const alert = await repo.report({ petName: 'Canela', species: 'dog', breed: 'Beagle', traits: 'Collar azul', lastSeenAt: 'Parque', phone: '999111222' });

  const lost = await repo.list('lost');
  expect(lost[0]?.id).toBe(alert.id);
  expect(alert.status).toBe('lost');
});

test('a sighting is added to the top of the alert', async () => {
  const repo = new MockAlertsRepository();
  const before = (await repo.byId('a1'))!.sightings.length;

  const updated = await repo.addSighting('a1', 'cerca del parque');

  expect(updated?.sightings.length).toBe(before + 1);
  expect(updated?.sightings[0]?.where).toBe('cerca del parque');
});
