import { Component, computed, inject, signal } from '@angular/core';
import { form, minLength, required, submit } from '@angular/forms/signals';
import { ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { loadable } from '../../core/loadable.ts';
import { PetsRepository } from '../../data/pets/pets.repository.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppField } from '../../shared/ui/app-field.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppMapSurface } from '../../shared/ui/app-map-surface.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppPetPicker } from '../../shared/ui/app-pet-picker.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppToggle } from '../../shared/ui/app-toggle.ts';
import { AlertsStore } from './alerts.store.ts';

@Component({
  selector: 'app-report-alert-page',
  imports: [AppButton, AppField, AppIcon, AppMapSurface, AppNavBar, AppPetPicker, AppScreen, AppToggle, ScrollView, Text, View],
  template: `
    <app-screen>
      <app-nav-bar title="Mascota perdida" />
      <scroll-view class="scroll" [contentContainerStyle]="{ flexGrow: 1 }" keyboardShouldPersistTaps="handled">
        <view class="page">
          <view class="block">
            <text class="label">¿Quién se perdió?</text>
            <app-pet-picker [pets]="pets.data() ?? []" [selectedId]="selectedId()" (choose)="petId.set($event)" />
          </view>

          <view class="block">
            <text class="label">Última vez vista</text>
            <view class="map"><app-map-surface [height]="80" [pins]="[{ id: 'here', x: 52, y: 62, kind: 'lost' }]" /></view>
            <app-field [control]="f.lastSeenAt" label="Lugar o referencia" icon="navigate" />
          </view>

          <view class="when">
            <app-icon name="calendar" [size]="24" tone="muted" />
            <text class="when-text">{{ now() }}</text>
          </view>

          <view class="block">
            <text class="label">Señas particulares</text>
            <app-field [control]="f.traits" label="Collar, manchas, cómo responde…" kind="multiline" />
          </view>

          <app-field [control]="f.phone" label="Teléfono de contacto" icon="phone" kind="phone" />

          <view class="notify">
            <view class="notify-text">
              <text class="notify-title">Avisar a quienes están a 3 km</text>
              <text class="notify-sub">Recibirán una notificación</text>
            </view>
            <app-toggle label="Avisar a quienes están a 3 km" [(checked)]="notifyNearby" />
          </view>

          @if (error(); as error) {
            <text class="error" accessibilityRole="alert">{{ error }}</text>
          }
          <view class="spacer"></view>
          <app-button label="Publicar alerta" variant="danger" [disabled]="busy()" (press)="publish()" />
        </view>
      </scroll-view>
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .scroll {
      flex: 1;
    }
    .page {
      flex: 1;
      gap: var(--space-4);
      padding: var(--space-2) var(--space-4) var(--space-4);
    }
    .block {
      gap: var(--space-2);
    }
    .label {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text-muted);
    }
    .map {
      overflow: hidden;
      border-radius: var(--radius-md);
      border-width: 1px;
      border-color: var(--color-border);
    }
    .when {
      min-height: var(--control-height);
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: 0 var(--space-4);
      border-width: 1.5px;
      border-color: var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
    }
    .when-text {
      font-size: var(--text-md);
      color: var(--color-text);
    }
    .notify {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-width: 1px;
      border-color: var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
    }
    .notify-text {
      flex: 1;
      gap: 2px;
    }
    .notify-title {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .notify-sub {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .error {
      font-size: var(--text-xs);
      color: var(--color-danger);
    }
    .spacer {
      flex: 1;
    }
  `,
})
export class ReportAlertPage {
  private readonly nav = inject(NativeNavigation);
  private readonly store = inject(AlertsStore);

  protected readonly pets = loadable(() => inject(PetsRepository).mine());
  protected readonly petId = signal<string | null>(null);
  /** The chosen pet, or the first one until the user picks. */
  protected readonly selectedId = computed(() => this.petId() ?? this.pets.data()?.[0]?.id ?? null);
  protected readonly notifyNearby = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly data = signal({ lastSeenAt: '', traits: '', phone: '' });
  protected readonly f = form(this.data, (path) => {
    required(path.lastSeenAt);
    required(path.traits);
    minLength(path.traits, 8);
    required(path.phone);
    minLength(path.phone, 7);
  });

  /** "Hoy, 18:40": the report is always about right now. */
  protected readonly now = computed(() => {
    const d = new Date();
    return `Hoy, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  protected async publish(): Promise<void> {
    this.error.set(null);
    const pet = (this.pets.data() ?? []).find((p) => p.id === this.selectedId());
    if (!pet) return void this.error.set('Estamos cargando tus mascotas. Inténtalo en un momento.');
    const sent = await submit(this.f, {
      action: async () => {
        this.busy.set(true);
        try {
          const { lastSeenAt, traits, phone } = this.data();
          await this.store.report({ petName: pet.name, breed: pet.breed, traits, lastSeenAt, phone });
          await this.nav.back();
        } catch {
          this.error.set('No pudimos publicar la alerta. Inténtalo de nuevo.');
        } finally {
          this.busy.set(false);
        }
      },
    });
    if (!sent) this.error.set('Completa los campos marcados en rojo.');
  }
}
