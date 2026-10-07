import { Component, computed, inject, viewChild } from '@angular/core';
import { Pressable, ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { alertLocation } from '../../data/alerts/alert-location.ts';
import { UserLocation } from '../../data/location/user-location.ts';
import { PetPortraits } from '../../data/photos/pet-portraits.ts';
import { ago } from '../../domain/format.ts';
import type { LostAlert } from '../../domain/models.ts';
import { AppAlertsMap, type AlertOnMap } from '../../shared/ui/app-alerts-map.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppChip } from '../../shared/ui/app-chip.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppIconButton } from '../../shared/ui/app-icon-button.ts';
import { AppMapSurface, type MapPin } from '../../shared/ui/app-map-surface.ts';
import { AppPhoto } from '../../shared/ui/app-photo.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { AppTag } from '../../shared/ui/app-tag.ts';
import { AlertsStore } from './alerts.store.ts';

@Component({
  selector: 'app-alerts-page',
  imports: [
    AppAlertsMap, AppButton, AppChip, AppIcon, AppIconButton, AppMapSurface, AppPhoto, AppSkeleton, AppState, AppTag, Pressable,
    ScrollView, Text, View,
  ],
  template: `
    <view class="bar">
      <view class="side"></view>
      <text class="title">Alertas</text>
      <view class="side"><app-icon-button label="Centrar en mi ubicación" (press)="realMap()?.recenter()"><app-icon name="locate" /></app-icon-button></view>
    </view>
    <view class="chips">
      <app-chip label="Perdidas" [selected]="store.tab() === 'lost'" (press)="store.tab.set('lost')" />
      <app-chip label="Encontradas" [selected]="store.tab() === 'found'" (press)="store.tab.set('found')" />
      <app-chip label="Radio 3 km" />
    </view>

    @if (here(); as origin) {
      <app-alerts-map [alerts]="onMap()" [origin]="origin" [height]="250" (pick)="openById($event)" />
    } @else {
      <app-map-surface [height]="250" [pins]="pins()" [me]="{ x: 50, y: 54 }" [radius]="150" />
    }

    <view class="sheet">
      <view class="grabber"></view>
      @switch (store.current().status()) {
        @case ('loading') {
          <view class="skeletons">
            @for (n of [1, 2]; track n) {
              <view class="skeleton-row">
                <app-skeleton [width]="70" [height]="70" [radius]="16" />
                <view class="grow">
                  <app-skeleton width="60%" [height]="14" />
                  <app-skeleton width="85%" [height]="11" />
                  <app-skeleton width="40%" [height]="12" />
                </view>
              </view>
            }
          </view>
        }
        @case ('error') {
          <app-state icon="wifiOff" title="No pudimos cargar las alertas" message="Revisa tu conexión e inténtalo de nuevo." action="Reintentar" actionVariant="primary" [bad]="true" (act)="store.current().reload()" />
        }
        @case ('empty') {
          <app-state icon="shield" title="Todo tranquilo por tu zona" message="No hay mascotas perdidas en 3 km. Si alguna se pierde, te avisamos al instante." action="Cambiar radio de aviso" />
        }
        @default {
          <scroll-view class="fill" [contentContainerStyle]="{ paddingBottom: 96 }">
            @for (alert of items(); track alert.id) {
              <pressable class="row" accessibilityRole="button" [accessibilityLabel]="alert.petName + ', ' + alert.breed" (press)="open(alert)">
                <view class="thumb"><app-photo [tone]="alert.status === 'lost' ? 'blue' : 'warm'" [src]="photo(alert)" [alt]="alert.petName" caption="Foto" /></view>
                <view class="info">
                  <text class="name">{{ alert.petName }} · {{ alert.breed }}</text>
                  <text class="where">{{ alert.status === 'lost' ? 'Visto por última vez en ' : 'Encontrado en ' }}{{ alert.lastSeenAt }}</text>
                  <app-tag [kind]="alert.status === 'lost' ? 'danger' : 'success'" [label]="tagOf(alert)" />
                </view>
              </pressable>
            }
          </scroll-view>
        }
      }
    </view>
    <view class="fab"><app-button label="Reportar mascota perdida" variant="accent" icon="plus" (press)="nav.push('/report')" /></view>
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
      padding: 0 var(--space-2);
    }
    .side {
      width: var(--tap-target);
    }
    .title {
      flex: 1;
      text-align: center;
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
    }
    .chips {
      flex-direction: row;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-4) var(--space-2);
    }
    .sheet {
      flex: 1;
      margin-top: -22px;
      padding-top: var(--space-2);
      border-top-left-radius: var(--radius-lg);
      border-top-right-radius: var(--radius-lg);
      border-top-width: 1px;
      border-top-color: var(--color-border);
      background-color: var(--color-surface);
    }
    .grabber {
      align-self: center;
      width: 44px;
      height: 5px;
      margin-bottom: var(--space-2);
      border-radius: 3px;
      background-color: var(--color-border);
    }
    .row {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-bottom-width: 1px;
      border-bottom-color: var(--color-border);
    }
    .thumb {
      width: 70px;
      height: 70px;
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .info {
      flex: 1;
      gap: 2px;
    }
    .name {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .where {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .skeletons {
      padding: var(--space-2) var(--space-4);
      gap: var(--space-4);
    }
    .skeleton-row {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
    }
    .grow {
      flex: 1;
      gap: var(--space-2);
    }
    .fab {
      position: absolute;
      right: var(--space-4);
      bottom: var(--space-3);
    }
  `,
})
export class AlertsPage {
  protected readonly nav = inject(NativeNavigation);
  protected readonly store = inject(AlertsStore);

  protected readonly items = computed(() => this.store.current().data() ?? []);
  protected readonly pins = computed<MapPin[]>(() =>
    this.items().map((a) => ({ id: a.id, x: a.pin.x, y: a.pin.y, kind: a.status, label: a.petName })),
  );

  /** Where the person is, once the device says so. Until then, and in tests, the drawn map shows. */
  protected readonly here = inject(UserLocation).here;
  private readonly portraits = inject(PetPortraits);
  protected readonly realMap = viewChild(AppAlertsMap);
  protected readonly onMap = computed<AlertOnMap[]>(() => {
    const origin = this.here();
    return origin ? this.items().map((a) => ({ id: a.id, petName: a.petName, status: a.status, location: alertLocation(origin, a) })) : [];
  });

  protected photo(alert: LostAlert): string | undefined {
    return this.portraits.portrait(alert.petName, alert.species);
  }

  protected tagOf(alert: LostAlert): string {
    return alert.status === 'lost' ? `Perdido ${ago(alert.minutesAgo)}` : `¡Encontrado! ${ago(alert.minutesAgo)}`;
  }

  protected open(alert: LostAlert): void {
    void this.nav.push('/alert/' + alert.id);
  }

  protected openById(id: string): void {
    if (id) void this.nav.push('/alert/' + id);
  }
}
