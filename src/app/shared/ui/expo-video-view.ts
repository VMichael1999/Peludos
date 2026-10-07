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
  /**
   * The player's shared-object id, not the player: `expo-video`'s own React view sends the id
   * (`player.__expo_shared_object_id__`) and native resolves it. A player object is dropped on the
   * way to the view, which then plays nothing.
   */
  readonly player = input.required<number>();
  readonly nativeControls = input(true);
  readonly contentFit = input<'contain' | 'cover' | 'fill'>('contain');
}
