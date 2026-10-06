import { Component, computed, input, output, signal } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import { compact } from '../../domain/format.ts';
import type { Post } from '../../domain/models.ts';
import { AppAvatar } from '../../shared/ui/app-avatar.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { ReelVideo } from './reel-video.ts';

/**
 * One full-screen reel. The video is a placeholder until a video source is wired in; the layout,
 * the action rail and the caption are final. A reel is always dark and white-on-dark: the video
 * is what carries the colour, so it does not follow the app's light or dark theme.
 */
@Component({
  selector: 'app-reel-card',
  imports: [AppAvatar, AppIcon, Pressable, ReelVideo, Text, View],
  template: `
    <view class="reel" [style]="{ height: height() }">
      <view class="video"><text class="video-label">Video vertical</text></view>
      @if (playing() && post().videoUrl; as url) {
        <app-reel-video [url]="url" />
      }
      <view class="scrim"></view>

      <view class="rail">
        <pressable class="action" accessibilityRole="button" [accessibilityLabel]="post().liked ? 'Quitar me gusta' : 'Me gusta'" [accessibilityState]="{ selected: post().liked }" (press)="like.emit(post())">
          <app-icon name="heart" [size]="32" tone="white" [fillTone]="post().liked ? 'danger' : null" />
          <text class="count">{{ likes() }}</text>
        </pressable>
        <view class="action" accessibilityLabel="Comentarios" accessible="true">
          <app-icon name="chat" [size]="32" tone="white" />
          <text class="count">{{ post().comments }}</text>
        </view>
        <pressable class="action" accessibilityRole="button" accessibilityLabel="Enviar" (press)="share.emit(post())">
          <app-icon name="send" [size]="32" tone="white" />
          <text class="count">Enviar</text>
        </pressable>
        <pressable class="action" accessibilityRole="button" [accessibilityLabel]="post().saved ? 'Quitar de guardados' : 'Guardar'" [accessibilityState]="{ selected: post().saved }" (press)="save.emit(post())">
          <app-icon name="bookmark" [size]="32" tone="white" [fillTone]="post().saved ? 'white' : null" />
        </pressable>
      </view>

      <view class="caption">
        <view class="who">
          <app-avatar [name]="post().petName" [size]="32" />
          <text class="pet">{{ post().petName }}</text>
          <pressable class="follow" accessibilityRole="button" [accessibilityLabel]="following() ? 'Siguiendo a ' + post().petName : 'Seguir a ' + post().petName" (press)="following.set(!following())">
            <text class="follow-text">{{ following() ? 'Siguiendo' : 'Seguir' }}</text>
          </pressable>
        </view>
        <text class="text" numberOfLines="3">{{ post().caption }}</text>
      </view>
    </view>
  `,
  styles: `
    .reel {
      background-color: #0a0f1a;
    }
    .video {
      flex: 1;
      align-items: center;
      justify-content: center;
      background-image: linear-gradient(160deg, #1b2d52, #0a0f1a);
    }
    .video-label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
    }
    .scrim {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 45%;
      background-image: linear-gradient(to bottom, rgba(10, 15, 26, 0), rgba(10, 15, 26, 0.85));
    }
    .rail {
      position: absolute;
      right: var(--space-2);
      bottom: var(--space-5);
      align-items: center;
      gap: var(--space-4);
    }
    .action {
      min-width: var(--tap-target);
      min-height: var(--tap-target);
      align-items: center;
      gap: 2px;
    }
    .count {
      font-size: var(--text-xs);
      font-weight: 700;
      color: #ffffff;
    }
    .caption {
      position: absolute;
      left: var(--space-4);
      right: 76px;
      bottom: var(--space-5);
      gap: var(--space-2);
    }
    .who {
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
    }
    .pet {
      font-size: var(--text-sm);
      font-weight: 800;
      color: #ffffff;
    }
    .follow {
      min-height: 32px;
      padding: 0 var(--space-3);
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-pill);
      background-color: #ffffff;
    }
    .follow-text {
      font-size: var(--text-xs);
      font-weight: 800;
      color: #0a0f1a;
    }
    .text {
      font-size: var(--text-sm);
      color: #ffffff;
    }
  `,
})
export class ReelCard {
  readonly post = input.required<Post>();
  readonly height = input.required<number>();
  /** True for the reel on screen: only that one mounts a player, so the others cost nothing. */
  readonly playing = input(false);
  readonly like = output<Post>();
  readonly save = output<Post>();
  readonly share = output<Post>();

  protected readonly following = signal(false);
  protected readonly likes = computed(() => compact(this.post().likes));
}
