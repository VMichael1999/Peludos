import { render, screen } from '@ng-native/testing';
import { expect, test } from 'vitest';
import { AppPhoto } from './app-photo.ts';

test('without an image it shows the placeholder caption', async () => {
  await render(AppPhoto, { inputs: { caption: 'Foto' } });

  expect(screen.getByText('Foto')).toBeTruthy();
  expect(screen.queryByLabelText('Canela en la playa')).toBeNull();
});

test('with an image it shows it, described for screen readers, in place of the caption', async () => {
  await render(AppPhoto, { inputs: { caption: 'Foto', src: 'https://images.dog.ceo/a.jpg', alt: 'Canela en la playa' } });

  expect(screen.getByLabelText('Canela en la playa')).toBeTruthy();
  expect(screen.queryByText('Foto')).toBeNull();
});
