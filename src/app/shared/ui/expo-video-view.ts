import { Component, input } from '@angular/core';

/**
 * `<expo-video>`, typed: expo-video's native view, registered by name in `main.ts`, with the props
 * the reels use as inputs so a template is checked against them. Each goes straight to the view.
 * The library ships the same kind of component for `<expo-image>` but not yet for the video view.
 */
@Component({
  selector: 'expo-video',
  template: '',
  host: {
    '[player]': 'player()',
    '[nativeControls]': 'nativeControls()',
    '[contentFit]': 'contentFit()',
  },
})
export class ExpoVideoView {
  /** The player from `videoPlayer()`, as `player.native`. */
  readonly player = input.required<unknown>();
  readonly nativeControls = input(true);
  readonly contentFit = input<'contain' | 'cover' | 'fill'>('contain');
}
