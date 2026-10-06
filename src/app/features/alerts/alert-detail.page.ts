import { Component, inject, input, resource, signal } from '@angular/core';
import { ScrollView, Text, View } from '@ng-native/components';
import { DeepLinks, Sharing } from '@ng-native/device';
import { AlertsRepository } from '../../data/alerts/alerts.repository.ts';
import { ago, distance } from '../../domain/format.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppIconButton } from '../../shared/ui/app-icon-button.ts';
import { AppMapSurface } from '../../shared/ui/app-map-surface.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppPhoto } from '../../shared/ui/app-photo.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { AppTag } from '../../shared/ui/app-tag.ts';
import { AlertsStore } from './alerts.store.ts';

@Component({
  selector: 'app-alert-detail-page',
  imports: [AppButton, AppIcon, AppIconButton, AppMapSurface, AppNavBar, AppPhoto, AppScreen, AppSkeleton, AppState, AppTag, ScrollView, Text, View],
  template: `
    <app-screen>
      <app-nav-bar title="Alerta">
        <app-icon-button label="Compartir alerta" (press)="share()"><app-icon name="send" /></app-icon-button>
      </app-nav-bar>

      @if (alert.isLoading() && !alert.hasValue()) {
        <view class="loading">
          <app-skeleton width="100%" [height]="170" [radius]="18" />
          <app-skeleton width="40%" [height]="14" />
          <app-skeleton width="60%" [height]="22" />
        </view>
      } @else if (alert.error() || !alert.value()) {
        <app-state icon="wifiOff" title="No encontramos esta alerta" message="Puede que ya se haya resuelto o que no tengas conexión." action="Reintentar" actionVariant="primary" [bad]="true" (act)="alert.reload()" />
      } @else if (alert.value(); as a) {
        <scroll-view class="fill" [contentContainerStyle]="{ paddingBottom: 16 }">
          <view class="hero"><app-photo [tone]="a.status === 'lost' ? 'blue' : 'warm'" [caption]="'Foto de ' + a.petName" /></view>
          <view class="head">
            <app-tag [kind]="a.status === 'lost' ? 'danger' : 'success'" [label]="a.status === 'lost' ? 'Perdido ' + when(a.minutesAgo) : '¡Encontrado! ' + when(a.minutesAgo)" />
            <text class="name">{{ a.petName }}</text>
            <text class="traits">{{ a.traits }}</text>
            <text class="traits">{{ a.status === 'lost' ? 'Visto por última vez en ' : 'Encontrado en ' }}{{ a.lastSeenAt }} · a {{ km(a.distanceKm) }}</text>
          </view>
          <view class="map">
            <app-map-surface [height]="92" [radius]="70" [pins]="[{ id: a.id, x: 50, y: 62, kind: a.status }]" />
          </view>

          <text class="section">Avistamientos ({{ a.sightings.length }})</text>
          @for (s of a.sightings; track s.id) {
            <view class="sighting">
              <view class="sighting-icon"><app-icon name="eye" [size]="20" /></view>
              <view class="sighting-text">
                <text class="sighting-title">{{ s.by }} lo vio {{ s.where }}</text>
                <text class="traits">{{ when(s.minutesAgo) }}</text>
              </view>
            </view>
          } @empty {
            <text class="empty">Nadie lo ha visto todavía. Si lo ves, avisa.</text>
          }
        </scroll-view>

        <view class="actions">
          @if (a.status === 'lost') {
            <app-button label="Lo vi" icon="eye" variant="accent" [disabled]="busy()" (press)="seen(a.id)" />
          }
          <app-button label="Contactar al dueño" icon="phone" variant="ghost" (press)="call(a.phone)" />
        </view>
      }
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    .loading {
      gap: var(--space-3);
      padding: var(--space-4);
    }
    .hero {
      height: 170px;
      margin: 0 var(--space-4);
      overflow: hidden;
      border-radius: 18px;
    }
    .head {
      gap: 4px;
      padding: var(--space-3) var(--space-4) 0;
    }
    .name {
      font-size: var(--text-xl);
      font-weight: 800;
      color: var(--color-text);
    }
    .traits {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .map {
      margin: var(--space-3) var(--space-4) 0;
      overflow: hidden;
      border-radius: var(--radius-md);
      border-width: 1px;
      border-color: var(--color-border);
    }
    .section {
      padding: var(--space-4) var(--space-4) var(--space-2);
      font-size: var(--text-md);
      font-weight: 800;
      color: var(--color-text);
    }
    .sighting {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-4);
    }
    .sighting-icon {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      align-items: center;
      justify-content: center;
      background-color: var(--color-accent-container);
    }
    .sighting-text {
      flex: 1;
      gap: 2px;
    }
    .sighting-title {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
    }
    .empty {
      padding: 0 var(--space-4);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
    .actions {
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4) var(--space-3);
    }
  `,
})
export class AlertDetailPage {
  private readonly repo = inject(AlertsRepository);
  private readonly store = inject(AlertsStore);
  private readonly links = inject(DeepLinks);
  private readonly sharing = inject(Sharing);

  /** Bound from the `alert/:id` route. */
  readonly id = input.required<string>();
  protected readonly busy = signal(false);

  protected readonly alert = resource({
    params: () => this.id(),
    loader: ({ params }) => this.repo.byId(params),
  });

  protected when(minutes: number): string {
    return ago(minutes);
  }

  protected km(value: number): string {
    return distance(value);
  }

  /** Adds a sighting at the user's spot, then shows the new list. */
  protected async seen(id: string): Promise<void> {
    this.busy.set(true);
    try {
      await this.store.addSighting(id, 'cerca de tu ubicación');
      this.alert.reload();
    } finally {
      this.busy.set(false);
    }
  }

  protected call(phone: string): void {
    this.links.open('tel:' + phone.replace(/\s/g, ''));
  }

  protected async share(): Promise<void> {
    const a = this.alert.value();
    if (!a) return;
    await this.sharing.share({ title: 'Mascota perdida', message: `${a.petName} (${a.breed}) se perdió cerca de ${a.lastSeenAt}. Ayúdanos con la búsqueda en Peludos.` });
  }
}
