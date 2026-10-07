import { Component, computed, inject } from '@angular/core';
import { Pressable, ScrollView, Text, View, VirtualList, VirtualListRow } from '@ng-native/components';
import { Dialogs } from '@ng-native/device';
import { NativeNavigation } from '@ng-native/router';
import { APP_NAME } from '../../core/brand.ts';
import { ago, distance } from '../../domain/format.ts';
import { AppAvatar } from '../../shared/ui/app-avatar.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppIconButton } from '../../shared/ui/app-icon-button.ts';
import { AppLogo } from '../../shared/ui/app-logo.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { AlertsStore } from '../alerts/alerts.store.ts';
import { FeedStore } from './feed.store.ts';
import { PostCard } from './post-card.ts';

@Component({
  selector: 'app-home-page',
  imports: [
    AppAvatar, AppIcon, AppIconButton, AppLogo, AppSkeleton, AppState, PostCard, Pressable, ScrollView, Text, View,
    VirtualList, VirtualListRow,
  ],
  template: `
    <view class="bar">
      <view class="brand">
        <app-logo [size]="36" />
        <text class="word">{{ name }}</text>
      </view>
      <view class="actions">
        <app-icon-button label="Crear publicación" (press)="nav.push('/create')"><app-icon name="plus" /></app-icon-button>
        <app-icon-button label="Notificaciones, 3 nuevas" badge="3" (press)="nav.push('/notifications')">
          <app-icon name="bell" />
        </app-icon-button>
        <app-icon-button label="Mensajes" (press)="messages()"><app-icon name="chat" /></app-icon-button>
      </view>
    </view>

    @switch (feed.status()) {
      @case ('loading') {
        <scroll-view class="fill">
          <view class="stories">
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <app-skeleton [width]="66" [height]="66" [radius]="33" />
            }
          </view>
          <view class="skeleton-card">
            <view class="row">
              <app-skeleton [width]="44" [height]="44" [radius]="22" />
              <view class="grow">
                <app-skeleton width="50%" [height]="13" />
                <app-skeleton width="30%" [height]="11" />
              </view>
            </view>
            <app-skeleton [height]="230" [radius]="16" />
            <app-skeleton width="80%" [height]="13" />
          </view>
        </scroll-view>
      }
      @case ('error') {
        <app-state
          icon="wifiOff"
          title="No pudimos cargar"
          message="Revisa tu conexión a internet e inténtalo de nuevo."
          action="Reintentar"
          actionVariant="primary"
          [bad]="true"
          (act)="feed.reload()"
        />
      }
      @case ('empty') {
        <app-state
          icon="camera"
          title="Aún no hay publicaciones"
          message="Sigue a otras mascotas o comparte la primera foto de la tuya."
          action="Crear publicación"
          actionVariant="primary"
          (act)="nav.push('/create')"
        />
      }
      @default {
        <virtual-list #list class="fill" [items]="feed.posts()" [estimatedItemHeight]="430" [keyExtractor]="idOf">
          <view listHeader>
            <view class="stories">
              @for (story of stories(); track story.id) {
                <view class="story">
                  <app-avatar [name]="story.mine ? '+' : story.petName" [species]="story.mine ? null : story.species" [size]="story.mine ? 74 : 64" [ring]="!story.mine" />
                  <text class="story-name" numberOfLines="2">{{ story.petName }}</text>
                </view>
              }
            </view>
            @if (alerts.nearest(); as nearest) {
              <pressable class="banner" accessibilityRole="button" [accessibilityLabel]="nearest.petName + ' se perdió cerca de ti. Ver alerta'" (press)="nav.push('/alert/' + nearest.id)">
                <app-icon name="alert" [size]="30" tone="danger" />
                <view class="banner-text">
                  <text class="banner-title">{{ nearest.petName }} se perdió cerca de ti</text>
                  <text class="banner-meta">{{ nearest.breed }} · a {{ km(nearest.distanceKm) }} · {{ when(nearest.minutesAgo) }}</text>
                </view>
                <text class="banner-go">Ver</text>
              </pressable>
            }
          </view>
          @for (row of list.window(); track row.slot) {
            <view [virtualListRow]="row">
              <app-post-card [post]="row.item" (like)="feed.toggleLike(row.item)" (save)="feed.toggleSave(row.item)" />
            </view>
          }
        </virtual-list>
      }
    }
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    .bar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-2) var(--space-1) var(--space-4);
    }
    .brand {
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
    }
    .word {
      font-size: var(--text-xl);
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--color-text);
    }
    .actions {
      flex-direction: row;
      align-items: center;
    }
    .stories {
      flex-direction: row;
      gap: var(--space-4);
      padding: var(--space-2) var(--space-4) var(--space-3);
    }
    .story {
      width: 76px;
      align-items: center;
      gap: var(--space-2);
    }
    .story-name {
      font-size: var(--text-xs);
      font-weight: 600;
      text-align: center;
      color: var(--color-text);
    }
    .banner {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      margin: var(--space-1) var(--space-4) var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-width: 1.5px;
      border-color: var(--color-danger);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
    }
    .banner-text {
      flex: 1;
    }
    .banner-title {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .banner-meta {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .banner-go {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-danger);
    }
    .skeleton-card {
      gap: var(--space-3);
      margin: 0 var(--space-4);
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
    }
    .row {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
    }
    .grow {
      flex: 1;
      gap: var(--space-2);
    }
  `,
})
export class HomePage {
  protected readonly nav = inject(NativeNavigation);
  protected readonly feed = inject(FeedStore);
  protected readonly alerts = inject(AlertsStore);
  private readonly dialogs = inject(Dialogs);

  protected readonly name = APP_NAME;
  protected readonly stories = computed(() => this.feed.stories.data() ?? []);
  protected readonly idOf = (post: { id: string }): string => post.id;
  protected readonly km = distance;
  protected readonly when = ago;

  protected messages(): void {
    void this.dialogs.tell('Mensajes', 'Los mensajes directos llegarán en una próxima etapa.');
  }
}
