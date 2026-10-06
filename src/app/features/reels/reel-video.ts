import { Component, effect, input } from '@angular/core';
import { Pressable } from '@ng-native/components';
import { videoPlayer } from '@ng-native/expo/video';
import { ExpoVideoView } from '../../shared/ui/expo-video-view.ts';

/**
 * Plays one reel's video, looping, filling its box. Tapping pauses and resumes it. It owns its
 * player, which is released when the component goes away, so the reels page only mounts it for the
 * reel on screen: scrolled past, the video stops and its decoder is freed.
 */
@Component({
  selector: 'app-reel-video',
  imports: [ExpoVideoView, Pressable],
  template: `
    <pressable class="fill" accessibilityRole="button" accessibilityLabel="Pausar o reanudar el video" (press)="toggle()">
      <expo-video class="fill" [player]="player.native" [nativeControls]="false" contentFit="cover" />
    </pressable>
  `,
  styles: `
    :host {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .fill {
      width: 100%;
      height: 100%;
    }
  `,
})
export class ReelVideo {
  readonly url = input.required<string>();

  protected readonly player = videoPlayer(null);

  constructor() {
    effect(() => {
      const native = this.player.native;
      native.loop = true;
      void native.replaceAsync(this.url()).then(() => native.play());
    });
  }

  protected toggle(): void {
    const native = this.player.native;
    if (native.playing) native.pause();
    else native.play();
  }
}
