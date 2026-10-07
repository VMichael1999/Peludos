import { Component, computed, effect, input, output, untracked } from '@angular/core';
import { ActivityIndicator, Pressable, View } from '@ng-native/components';
import { videoPlayer } from '@ng-native/expo/video';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { ExpoVideoView } from '../../shared/ui/expo-video-view.ts';

/**
 * One reel's video, looping, filling its box. It owns its player, released when the component goes
 * away, so the page mounts it only for the reel on screen and the one after it.
 *
 * `active` is the one on screen: it plays, and tapping it pauses and resumes. The one after it is
 * mounted with `active` off: it loads and waits, so swiping to it starts at once, and it costs a
 * decoder instead of a download on swipe.
 */
@Component({
  selector: 'app-reel-video',
  imports: [ActivityIndicator, AppIcon, ExpoVideoView, Pressable, View],
  template: `
    <pressable class="fill" accessibilityRole="button" [accessibilityLabel]="paused() ? 'Reanudar el video' : 'Pausar el video'" (press)="toggle()">
      <expo-video class="fill" [player]="playerId" [nativeControls]="false" contentFit="cover" />
      @if (loading()) {
        <view class="center" pointerEvents="none"><activity-indicator size="large" color="#ffffff" /></view>
      }
      @if (paused()) {
        <view class="center" pointerEvents="none"><app-icon name="play" [size]="64" tone="white" [fillTone]="'white'" /></view>
      }
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
    .center {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class ReelVideo {
  readonly url = input.required<string>();
  /** The reel on screen, which plays; off, the video only loads. */
  readonly active = input(true);
  readonly muted = input(false);
  /** The video could not be played: the address is bad or the network dropped. */
  readonly failed = output<void>();

  protected readonly player = videoPlayer(null);
  /** What the native view takes in place of the player itself. */
  protected readonly playerId = (this.player.native as unknown as { __expo_shared_object_id__: number }).__expo_shared_object_id__;

  /** Waiting for the first frames of the reel on screen. */
  protected readonly loading = computed(() => this.active() && this.player.state().status === 'loading');
  /** Paused by a tap: on screen, loaded, and not playing. */
  protected readonly paused = computed(() => this.active() && this.player.state().status === 'readyToPlay' && !this.player.state().playing);

  constructor() {
    const native = this.player.native;
    native.loop = true;

    effect(() => {
      native.muted = this.muted();
    });
    effect(() => {
      const url = this.url();
      untracked(() => {
        void native.replaceAsync(url).then(() => {
          if (this.active()) native.play();
        });
      });
    });
    effect(() => {
      if (this.active()) native.play();
      else native.pause();
    });
    effect(() => {
      if (this.player.state().status === 'error') untracked(() => this.failed.emit());
    });
  }

  protected toggle(): void {
    const native = this.player.native;
    if (native.playing) native.pause();
    else native.play();
  }
}
