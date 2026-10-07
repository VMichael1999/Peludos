import { compact } from '../../domain/format.ts';
import type { Post, ReelVideo } from '../../domain/models.ts';

const MAX_TAGS = 4;

/**
 * A feed video as the reel card draws it: the maker as the "pet", hashtags and the view count as
 * the caption, and the still as the poster shown while the video loads. Liking and saving are
 * local: there is no backend for them yet.
 */
export function reelPost(video: ReelVideo, state: { liked: boolean; saved: boolean }): Post {
  const hashtags = video.tags.slice(0, MAX_TAGS).map((tag) => '#' + tag.replace(/\s+/g, ''));
  const views = video.views > 0 ? `${compact(video.views)} vistas` : '';
  return {
    id: video.id,
    petName: video.user,
    species: video.tags.some((t) => /cat|kitten|gat/i.test(t)) ? 'cat' : 'dog',
    ownerName: video.user,
    caption: [hashtags.join(' '), views].filter(Boolean).join(' · '),
    minutesAgo: 0,
    likes: video.likes + (state.liked ? 1 : 0),
    comments: 0,
    liked: state.liked,
    saved: state.saved,
    tone: 'blue',
    kind: 'reel',
    photoUrl: video.thumbnail || undefined,
    videoUrl: video.videoUrl ?? undefined,
  };
}
