import { Component, inject, input, resource } from '@angular/core';
import { ScrollView, Text, View } from '@ng-native/components';
import { DeepLinks } from '@ng-native/device';
import { PlacesRepository } from '../../data/places/places.repository.ts';
import { price, stars } from '../../domain/format.ts';
import { AppAvatar } from '../../shared/ui/app-avatar.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppPhoto } from '../../shared/ui/app-photo.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';

@Component({
  selector: 'app-store-detail-page',
  imports: [AppAvatar, AppButton, AppNavBar, AppPhoto, AppScreen, AppSkeleton, AppState, ScrollView, Text, View],
  template: `
    <app-screen>
      <app-nav-bar [title]="place.value()?.name ?? 'Tienda'" />
      @if (place.isLoading()) {
        <view class="loading">
          <app-skeleton [width]="64" [height]="64" [radius]="16" />
          <app-skeleton width="70%" [height]="16" />
          <app-skeleton width="50%" [height]="12" />
        </view>
      } @else if (place.error()) {
        <app-state icon="wifiOff" title="No pudimos cargar este lugar" message="Revisa tu conexión e inténtalo de nuevo." action="Reintentar" actionVariant="primary" [bad]="true" (act)="place.reload()" />
      } @else if (place.value(); as p) {
        <scroll-view class="fill" [contentContainerStyle]="{ paddingBottom: 32 }">
          <view class="head">
            <app-avatar [name]="p.name" [size]="64" />
            <view class="grow">
              <text class="name">{{ p.name }}</text>
              <text class="meta">{{ p.tagline }}</text>
              <text class="meta">{{ rating(p.rating) }}{{ p.openLabel }}</text>
            </view>
          </view>
          <view class="actions">
            <view class="grow"><app-button label="Escribir" icon="chat" (press)="text(p.phone)" /></view>
            <view class="grow"><app-button label="Llamar" icon="phone" variant="ghost" (press)="call(p.phone)" /></view>
          </view>

          @if (p.kind === 'shop') {
            <text class="section">Catálogo</text>
            @if (catalog.hasValue() && !catalog.value().length) {
              <text class="note">Esta tienda aún no publica su catálogo aquí. Escríbele o llámale para consultar.</text>
            }
            <view class="grid">
              @for (product of catalog.value() ?? []; track product.id) {
                <view class="card">
                  <view class="card-photo"><app-photo caption="Foto" /></view>
                  <view class="card-body">
                    <text class="product" numberOfLines="2">{{ product.name }}</text>
                    <text class="meta">{{ product.category }}</text>
                    <text class="price">{{ money(product.price) }}</text>
                  </view>
                </view>
              }
            </view>
          } @else {
            <text class="note">Este lugar no tiene catálogo. Escríbele o llámale para pedir una cita.</text>
          }
        </scroll-view>
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
    .head {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
    }
    .grow {
      flex: 1;
      gap: 2px;
    }
    .name {
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
    }
    .meta {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .actions {
      flex-direction: row;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4) var(--space-3);
    }
    .section {
      padding: var(--space-3) var(--space-4) var(--space-2);
      font-size: var(--text-md);
      font-weight: 800;
      color: var(--color-text);
    }
    .note {
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
    .grid {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--space-3);
      padding: 0 var(--space-4);
    }
    .card {
      width: 47.5%;
      overflow: hidden;
      border-radius: var(--radius-md);
      border-width: 1px;
      border-color: var(--color-border);
      background-color: var(--color-surface);
    }
    .card-photo {
      height: 96px;
    }
    .card-body {
      gap: 2px;
      padding: var(--space-2) var(--space-3) var(--space-3);
    }
    .product {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text);
    }
    .price {
      padding-top: 2px;
      font-size: var(--text-sm);
      font-weight: 800;
      color: var(--color-primary);
    }
  `,
})
export class StoreDetailPage {
  private readonly repo = inject(PlacesRepository);
  private readonly links = inject(DeepLinks);

  /** Bound from the `store/:id` route. */
  readonly id = input.required<string>();

  protected readonly place = resource({
    params: () => this.id(),
    loader: ({ params }) => this.repo.byId(params),
  });
  protected readonly catalog = resource({
    params: () => this.id(),
    loader: ({ params }) => this.repo.catalog(params),
  });

  /** "4,8 ★ · ", or nothing when there is no rating. */
  protected rating(value: number | null): string {
    const text = stars(value);
    return text ? text + ' · ' : '';
  }

  protected money(value: number): string {
    return price(value);
  }

  /** Opens a message to the shop in the device's Messages app, until in-app chat exists. */
  protected text(phone: string): void {
    this.links.open('sms:' + phone.replace(/\s/g, ''));
  }

  protected call(phone: string): void {
    this.links.open('tel:' + phone.replace(/\s/g, ''));
  }
}
