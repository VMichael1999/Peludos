import { render, screen, userEvent } from '@ng-native/testing';
import { expect, test, vi } from 'vitest';
import type { Post } from '../../domain/models.ts';
import { ReelCard } from './reel-card.ts';

const post: Post = {
  id: 'p2', petName: 'Max', species: 'dog', ownerName: 'Marco', caption: 'Aprendió a abrir la puerta solo.',
  minutesAgo: 300, likes: 2400, comments: 86, liked: false, saved: false, tone: 'warm', kind: 'reel',
};

test('shows the pet, the caption and the compact like count', async () => {
  await render(ReelCard, { inputs: { post, height: 700 } });

  expect(screen.getByText('Max')).toBeTruthy();
  expect(screen.getByText('Aprendió a abrir la puerta solo.')).toBeTruthy();
  expect(screen.getByText('2,4 mil')).toBeTruthy();
});

test('liking and sharing are reported to the page; following is local', async () => {
  const user = userEvent.setup();
  const like = vi.fn();
  const share = vi.fn();
  await render(ReelCard, { inputs: { post, height: 700 }, on: { like, share } });

  await user.press(screen.getByRole('button', { name: 'Me gusta' }));
  await user.press(screen.getByRole('button', { name: 'Enviar' }));
  await user.press(screen.getByRole('button', { name: 'Seguir a Max' }));

  expect(like).toHaveBeenCalledWith(post);
  expect(share).toHaveBeenCalledWith(post);
  expect(screen.getByRole('button', { name: 'Siguiendo a Max' })).toBeTruthy();
});
