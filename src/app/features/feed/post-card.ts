import { Component, computed, input, output } from '@angular/core';
import { Text, View } from '@ng-native/components';
import { compact, ago } from '../../domain/format.ts';
import type { Post } from '../../domain/models.ts';
import { AppAvatar } from '../../shared/ui/app-avatar.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppIconButton } from '../../shared/ui/app-icon-button.ts';
import { AppPhoto } from '../../shared/ui/app-photo.ts';

/** One publication: who, the photo, the actions, the caption. Presentational: it only emits. */
@Component({
  selector: 'app-post-card',
  imports: [AppAvatar, AppIcon, AppIconButton, AppPhoto, Text, View],
  template: `
    <view class="card">
      <view class="head">
        <app-avatar [name]="post().petName" [size]="44" />
        <view class="who">
          <text class="name">{{ post().petName }}</text>
          <text class="meta">de {{ post().ownerName }} · {{ when() }}</text>
        </view>
        <app-icon-button label="Más opciones"><app-icon name="more" [size]="28" /></app-icon-button>
      </view>
      <view class="photo"><app-photo [tone]="post().tone" [src]="post().photoUrl" [alt]="post().petName + ': ' + post().caption" [caption]="post().kind === 'reel' ? 'Reel' : 'Foto'" /></view>
      <view class="acts">
        <app-icon-button [label]="post().liked ? 'Quitar me gusta' : 'Me gusta'" (press)="like.emit()">
          <app-icon name="heart" [size]="30" [tone]="post().liked ? 'danger' : 'text'" [fillTone]="post().liked ? 'danger' : null" />
        </app-icon-button>
        <app-icon-button label="Comentar"><app-icon name="chat" [size]="30" /></app-icon-button>
        <app-icon-button label="Compartir"><app-icon name="send" [size]="30" /></app-icon-button>
        <view class="grow"></view>
        <app-icon-button [label]="post().saved ? 'Quitar de guardados' : 'Guardar'" (press)="save.emit()">
          <app-icon name="bookmark" [size]="30" [fillTone]="post().saved ? 'text' : null" />
        </app-icon-button>
      </view>
      <view class="text">
        <text class="likes">{{ likes() }} me gusta</text>
        <text class="caption">{{ post().caption }}</text>
      </view>
    </view>
  `,
  styles: `
    :host {
      padding: 0 var(--space-4) var(--space-4);
    }
    .card {
      background-color: var(--color-surface);
      border-width: 1px;
      border-color: var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .head {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-2) var(--space-3) var(--space-4);
    }
    .who {
      flex: 1;
    }
    .name {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .meta {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .photo {
      height: 240px;
    }
    .acts {
      flex-direction: row;
      align-items: center;
      padding: var(--space-1) var(--space-2) 0;
    }
    .grow {
      flex: 1;
    }
    .text {
      padding: 0 var(--space-4) var(--space-4);
      gap: 2px;
    }
    .likes {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .caption {
      font-size: var(--text-sm);
      color: var(--color-text);
    }
  `,
})
export class PostCard {
  readonly post = input.required<Post>();
  readonly like = output<void>();
  readonly save = output<void>();

  protected readonly when = computed(() => ago(this.post().minutesAgo));
  protected readonly likes = computed(() => compact(this.post().likes));
}
