import { Component, computed, inject, signal } from '@angular/core';
import { Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { Session } from '../../core/session.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';

/** Offered once, after the first sign-in, on a device that can do Face ID or a fingerprint. */
@Component({
  selector: 'app-enable-biometrics-page',
  imports: [AppButton, AppIcon, AppScreen, Text, View],
  template: `
    <app-screen>
      <view class="page">
        <view class="intro">
          <view class="disc"><app-icon [name]="face() ? 'faceId' : 'user'" [size]="48" tone="primary" [strokeWidth]="1.5" /></view>
          <text class="title">{{ face() ? 'Entra más rápido con Face ID' : 'Entra más rápido con tu huella' }}</text>
          <text class="message">
            La próxima vez podrás abrir Peludos {{ face() ? 'con tu rostro' : 'con tu huella' }}, sin escribir la
            contraseña. Puedes cambiarlo en Ajustes.
          </text>
          @if (error(); as error) {
            <text class="error" accessibilityRole="alert">{{ error }}</text>
          }
        </view>
        <view class="actions">
          <app-button [label]="face() ? 'Activar Face ID' : 'Activar huella'" [icon]="face() ? 'faceId' : 'user'" (press)="enable()" />
          <app-button label="Ahora no" variant="ghost" (press)="skip()" />
        </view>
      </view>
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .page {
      flex: 1;
      padding: 0 var(--space-5) var(--space-5);
    }
    .intro {
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: 0 var(--space-4);
    }
    .disc {
      width: 112px;
      height: 112px;
      border-radius: 56px;
      background-color: var(--color-primary-container);
      align-items: center;
      justify-content: center;
    }
    .title {
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
      text-align: center;
    }
    .message {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      text-align: center;
    }
    .error {
      font-size: var(--text-xs);
      color: var(--color-danger);
      text-align: center;
    }
    .actions {
      gap: var(--space-2);
    }
  `,
})
export class EnableBiometricsPage {
  private readonly nav = inject(NativeNavigation);
  private readonly session = inject(Session);

  protected readonly face = computed(() => this.session.biometricKind() === 'face');
  protected readonly error = signal<string | null>(null);

  protected async enable(): Promise<void> {
    const result = await this.session.enableBiometrics();
    if (!result.ok) return void this.error.set(result.error);
    await this.finish();
  }

  protected async skip(): Promise<void> {
    await this.finish();
  }

  private async finish(): Promise<void> {
    this.session.biometricPrompted.set(true);
    await this.nav.reset('/app');
  }
}
