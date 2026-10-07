import type { Post, ReelVideo, StoryItem } from '../../domain/models.ts';

const MAX_POSTS = 4;
const MAX_VIDEOS = 2;
const MAX_FALLBACK = 3;
const PHOTO_SECONDS = 5;
const MIN_VIDEO_SECONDS = 4;
const MAX_VIDEO_SECONDS = 10;

/**
 * What a pet's story shows: its own newest posts as photos, with videos between them. A story is a
 * round of the pet's moments, so the photos and the videos alternate, starting with a photo. A pet
 * with no posts that have a photo shows a few photos from its gallery, and with nothing at all the
 * story is empty and the page does not open.
 */
export function buildStory(input: {
  readonly petName: string;
  readonly posts: readonly Post[];
  readonly videos: readonly ReelVideo[];
  readonly gallery: readonly string[];
}): StoryItem[] {
  const photos: StoryItem[] = input.posts
    .filter((p) => p.petName === input.petName && p.photoUrl)
    .sort((a, b) => a.minutesAgo - b.minutesAgo)
    .slice(0, MAX_POSTS)
    .map((p) => ({ id: 'post-' + p.id, kind: 'photo', url: p.photoUrl!, caption: p.caption, seconds: PHOTO_SECONDS }));

  const videos: StoryItem[] = input.videos
    .filter((v) => v.videoUrl)
    .slice(0, MAX_VIDEOS)
    .map((v) => ({
      id: 'video-' + v.id,
      kind: 'video',
      url: v.videoUrl!,
      caption: v.tags.slice(0, 3).map((t) => '#' + t.replace(/\s+/g, '')).join(' '),
      seconds: Math.min(MAX_VIDEO_SECONDS, Math.max(MIN_VIDEO_SECONDS, v.duration)),
    }));

  const items: StoryItem[] = [];
  for (let i = 0; i < Math.max(photos.length, videos.length); i++) {
    if (photos[i]) items.push(photos[i]);
    if (videos[i]) items.push(videos[i]);
  }
  if (items.length) return items;

  return input.gallery.slice(0, MAX_FALLBACK).map((url, i) => ({ id: 'gallery-' + i, kind: 'photo', url, caption: '', seconds: PHOTO_SECONDS }));
}
