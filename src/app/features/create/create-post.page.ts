import { Component, computed, inject, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { loadable } from '../../core/loadable.ts';
import { Session } from '../../core/session.ts';
import { PetsRepository } from '../../data/pets/pets.repository.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppChip } from '../../shared/ui/app-chip.ts';
import { AppField } from '../../shared/ui/app-field.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppPetPicker } from '../../shared/ui/app-pet-picker.ts';
import { AppPhoto } from '../../shared/ui/app-photo.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppToggle } from '../../shared/ui/app-toggle.ts';
import { FeedStore } from '../feed/feed.store.ts';

/**
 * New post. The photo is a placeholder until the image picker is wired in; everything else is
 * real: which pet, the caption, photo or reel, and the location switch (off by default).
 */
@Component({
  selector: 'app-create-post-page',
  imports: [AppButton, AppChip, AppField, AppNavBar, AppPetPicker, AppPhoto, AppScreen, AppToggle, ScrollView, Text, View],
  template: `
    <app-screen>
      <app-nav-bar title="Nueva publicación">
        <view class="publish"><app-button label="Publicar" [compact]="true" [disabled]="busy()" (press)="publish()" /></view>
      </app-nav-bar>
      <scroll-view class="fill" keyboardShouldPersistTaps="handled" [contentContainerStyle]="{ paddingBottom: 24 }">
        <view class="photo"><app-photo caption="Foto elegida" /></view>
        <view class="chips">
          <app-chip label="Foto" [selected]="kind() === 'photo'" (press)="kind.set('photo')" />
          <app-chip label="Reel" [selected]="kind() === 'reel'" (press)="kind.set('reel')" />
        </view>
        <view class="form">
          <view class="block">
            <text class="label">¿Quién sale en la foto?</text>
            <app-pet-picker [pets]="pets.data() ?? []" [selectedId]="selectedId()" (choose)="petId.set($event)" />
          </view>
          <app-field [control]="f.caption" label="Escribe un pie de foto…" kind="multiline" />
          <view class="location">
            <text class="location-text">Mostrar mi ubicación aproximada</text>
            <app-toggle label="Mostrar mi ubicación aproximada" [(checked)]="showLocation" />
          </view>
          @if (error(); as error) {
            <text class="error" accessibilityRole="alert">{{ error }}</text>
          }
        </view>
      </scroll-view>
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    .publish {
      margin-right: var(--space-2);
    }
    .photo {
      height: 250px;
      margin: 0 var(--space-4);
      overflow: hidden;
      border-radius: 18px;
    }
    .chips {
      flex-direction: row;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4) 0;
    }
    .form {
      gap: var(--space-4);
      padding: var(--space-4);
    }
    .block {
      gap: var(--space-2);
    }
    .label {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text-muted);
    }
    .location {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-width: 1px;
      border-color: var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
    }
    .location-text {
      flex: 1;
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .error {
      font-size: var(--text-xs);
      color: var(--color-danger);
    }
  `,
})
export class CreatePostPage {
  private readonly nav = inject(NativeNavigation);
  private readonly feed = inject(FeedStore);
  private readonly session = inject(Session);

  protected readonly pets = loadable(() => inject(PetsRepository).mine());
  protected readonly petId = signal<string | null>(null);
  protected readonly selectedId = computed(() => this.petId() ?? this.pets.data()?.[0]?.id ?? null);
  protected readonly kind = signal<'photo' | 'reel'>('photo');
  protected readonly showLocation = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly data = signal({ caption: '' });
  protected readonly f = form(this.data);

  protected async publish(): Promise<void> {
    this.error.set(null);
    const pet = this.pets.data()?.find((p) => p.id === this.selectedId());
    if (!pet) return void this.error.set('Estamos cargando tus mascotas. Inténtalo en un momento.');
    await submit(this.f, {
      action: async () => {
        this.busy.set(true);
        try {
          await this.feed.publish({
            petName: pet.name,
            species: pet.species,
            ownerName: this.session.user()?.username ?? pet.ownerName,
            caption: this.data().caption.trim(),
            kind: this.kind(),
          });
          await this.nav.back();
        } catch {
          this.error.set('No pudimos publicar. Inténtalo de nuevo.');
        } finally {
          this.busy.set(false);
        }
      },
    });
  }
}
