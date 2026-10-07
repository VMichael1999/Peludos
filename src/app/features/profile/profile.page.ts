import { Component, computed, inject, resource, signal } from '@angular/core';
import { Pressable, ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import type { IconName } from '../../core/icons.ts';
import { HealthRepository } from '../../data/health/health.repository.ts';
import { PetPortraits } from '../../data/photos/pet-portraits.ts';
import { compact } from '../../domain/format.ts';
import { AppAvatar } from '../../shared/ui/app-avatar.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppIconButton } from '../../shared/ui/app-icon-button.ts';
import { AppPhoto } from '../../shared/ui/app-photo.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { ProfileStore } from './profile.store.ts';

type ProfileTab = 'posts' | 'reels' | 'health';

const TABS: readonly { readonly id: ProfileTab; readonly icon: IconName; readonly label: string }[] = [
  { id: 'posts', icon: 'grid', label: 'Publicaciones' },
  { id: 'reels', icon: 'reels', label: 'Reels' },
  { id: 'health', icon: 'pulse', label: 'Salud' },
];

@Component({
  selector: 'app-profile-page',
  imports: [AppAvatar, AppButton, AppIcon, AppIconButton, AppPhoto, AppSkeleton, AppState, Pressable, ScrollView, Text, View],
  template: `
    <view class="bar">
      <text class="brand" numberOfLines="1">{{ store.current()?.name ?? 'Perfil' }}</text>
      <app-icon-button label="Crear publicación" (press)="nav.push('/create')"><app-icon name="plus" /></app-icon-button>
      <app-icon-button label="Ajustes" (press)="nav.push('/appearance')"><app-icon name="more" /></app-icon-button>
    </view>

    @switch (store.pets.status()) {
      @case ('loading') {
        <view class="loading">
          <app-skeleton [width]="86" [height]="86" [radius]="43" />
          <app-skeleton width="60%" [height]="16" />
          <app-skeleton width="80%" [height]="12" />
        </view>
      }
      @case ('error') {
        <app-state icon="wifiOff" title="No pudimos cargar tu perfil" message="Revisa tu conexión e inténtalo de nuevo." action="Reintentar" actionVariant="primary" [bad]="true" (act)="store.pets.reload()" />
      }
      @case ('empty') {
        <app-state icon="paw" title="Aún no tienes mascotas" message="Añade a tu primera mascota para armar su perfil." />
      }
      @default {
        @if (store.current(); as pet) {
          <scroll-view class="fill" [contentContainerStyle]="{ paddingBottom: 24 }">
            <view class="head">
              <app-avatar [name]="pet.name" [species]="pet.species" [size]="86" [ring]="true" />
              <view class="stats">
                <view class="stat"><text class="stat-n">{{ pet.posts }}</text><text class="stat-l">Posts</text></view>
                <view class="stat"><text class="stat-n">{{ count(pet.followers) }}</text><text class="stat-l">Seguidores</text></view>
                <view class="stat"><text class="stat-n">{{ pet.following }}</text><text class="stat-l">Siguiendo</text></view>
              </view>
            </view>
            <view class="about">
              <text class="name">{{ pet.name }}</text>
              <text class="meta">{{ pet.breed }} · {{ pet.ageYears }} años · de {{ pet.ownerName }}</text>
              <text class="meta">{{ pet.bio }}</text>
            </view>

            <view class="actions">
              <app-button label="Ver salud" icon="pulse" (press)="nav.push('/health/' + pet.id)" />
            </view>

            <view class="pets" accessibilityRole="tablist">
              @for (other of store.pets.data() ?? []; track other.id) {
                <pressable
                  class="pet"
                  accessibilityRole="tab"
                  [accessibilityLabel]="other.name"
                  [accessibilityState]="{ selected: other.id === pet.id }"
                  (press)="store.select(other.id)"
                >
                  <app-avatar [name]="other.name" [species]="other.species" [size]="40" [ring]="other.id === pet.id" />
                </pressable>
              }
            </view>

            <view class="ptabs" accessibilityRole="tablist">
              @for (t of tabs; track t.id) {
                <pressable
                  class="ptab"
                  accessibilityRole="tab"
                  [accessibilityLabel]="t.label"
                  [accessibilityState]="{ selected: tab() === t.id }"
                  [attr.data-on]="tab() === t.id || null"
                  (press)="tab.set(t.id)"
                >
                  <app-icon [name]="t.icon" [size]="26" [tone]="tab() === t.id ? 'primary' : 'muted'" />
                </pressable>
              }
            </view>

            @if (tab() === 'health') {
              <view class="health">
                @if (health.value(); as record) {
                  <view class="summary">
                    <text class="summary-small">Próxima vacuna</text>
                    <text class="summary-title">{{ record.nextVaccine.name }} · en {{ record.nextVaccine.inDays }} días</text>
                    <text class="meta">{{ record.vaccines.length }} vacunas registradas · {{ record.weightKg }} kg</text>
                  </view>
                } @else {
                  <text class="meta">El carnet de {{ pet.name }}: vacunas, desparasitación y peso.</text>
                }
                <app-button label="Abrir carnet de salud" variant="ghost" (press)="nav.push('/health/' + pet.id)" />
              </view>
            } @else {
              <view class="grid">
                @for (tile of tiles(); track $index) {
                  <view class="tile">
                    <app-photo [tone]="toneOf($index)" [src]="tile" [alt]="'Foto de ' + pet.name" />
                    @if (tab() === 'reels') {
                      <view class="play" pointerEvents="none"><app-icon name="play" [size]="22" tone="white" [fillTone]="'white'" /></view>
                    }
                  </view>
                }
              </view>
            }
          </scroll-view>
        }
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
      padding: 0 var(--space-2) 0 var(--space-4);
    }
    .brand {
      flex: 1;
      font-size: var(--text-xl);
      font-weight: 800;
      color: var(--color-text);
    }
    .loading {
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-5);
    }
    .head {
      flex-direction: row;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-2) var(--space-4);
    }
    .stats {
      flex: 1;
      flex-direction: row;
      justify-content: space-around;
    }
    .stat {
      align-items: center;
    }
    .stat-n {
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
    }
    .stat-l {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .about {
      gap: 2px;
      padding: var(--space-2) var(--space-4) 0;
    }
    .name {
      font-size: var(--text-md);
      font-weight: 800;
      color: var(--color-text);
    }
    .meta {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .actions {
      padding: var(--space-3) var(--space-4);
    }
    .pets {
      flex-direction: row;
      gap: var(--space-2);
      padding: 0 var(--space-4) var(--space-2);
    }
    .pet {
      min-width: var(--tap-target);
      min-height: var(--tap-target);
      align-items: center;
      justify-content: center;
    }
    .ptabs {
      flex-direction: row;
      border-top-width: 1px;
      border-top-color: var(--color-border);
    }
    .ptab {
      flex: 1;
      min-height: var(--tap-target);
      align-items: center;
      justify-content: center;
      border-bottom-width: 2px;
      border-bottom-color: transparent;
    }
    .ptab[data-on] {
      border-bottom-color: var(--color-primary);
    }
    .health {
      gap: var(--space-3);
      padding: var(--space-4);
    }
    .summary {
      gap: var(--space-1);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      background-color: var(--color-surface-2);
    }
    .summary-small {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text-muted);
    }
    .summary-title {
      font-size: var(--text-md);
      font-weight: 800;
      color: var(--color-text);
    }
    .play {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
    }
    .grid {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 2px;
      padding-top: 2px;
    }
    .tile {
      width: 33%;
      aspect-ratio: 1;
    }
  `,
})
export class ProfilePage {
  protected readonly nav = inject(NativeNavigation);
  protected readonly store = inject(ProfileStore);

  protected readonly tabs = TABS;
  protected readonly tab = signal<ProfileTab>('posts');
  private readonly portraits = inject(PetPortraits);
  private readonly healthRepo = inject(HealthRepository);

  protected readonly health = resource({
    params: () => this.store.current()?.id,
    loader: ({ params }) => (params ? this.healthRepo.forPet(params) : Promise.resolve(undefined)),
  });

  /**
   * The photos of the tab on show: the pet's own, from the pool no portrait uses. Reels show a
   * different set, with a play badge. Without photos (offline, tests) the tiles are placeholders.
   */
  protected readonly tiles = computed<(string | undefined)[]>(() => {
    const pet = this.store.current();
    if (!pet) return [];
    const reels = this.tab() === 'reels';
    const photos = this.portraits.gallery(pet.name, pet.species, reels ? 6 : 9, reels ? 9 : 0);
    return photos.length ? photos : Array.from({ length: reels ? 3 : 6 }, () => undefined);
  });

  protected count(value: number): string {
    return compact(value);
  }

  protected toneOf(n: number): 'blue' | 'border' | 'warm' {
    return n % 3 === 0 ? 'warm' : n % 2 === 0 ? 'border' : 'blue';
  }
}
