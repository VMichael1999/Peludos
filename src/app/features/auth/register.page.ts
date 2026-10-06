import { Component, inject, signal } from '@angular/core';
import { email, form, minLength, pattern, required, submit } from '@angular/forms/signals';
import { ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { Session } from '../../core/session.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppCheckbox } from '../../shared/ui/app-checkbox.ts';
import { AppField } from '../../shared/ui/app-field.ts';
import { AppLogo } from '../../shared/ui/app-logo.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';

@Component({
  selector: 'app-register-page',
  imports: [AppButton, AppCheckbox, AppField, AppLogo, AppNavBar, AppScreen, ScrollView, Text, View],
  template: `
    <app-screen>
      <app-nav-bar title="Crear cuenta" />
      <scroll-view class="scroll" [contentContainerStyle]="{ flexGrow: 1 }" keyboardShouldPersistTaps="handled">
        <view class="page">
          <view class="intro">
            <app-logo [size]="60" />
            <text class="intro-text">Crea tu cuenta y arma el perfil de tu mascota.</text>
          </view>
          <view class="stack">
            <app-field [control]="f.username" label="Nombre de usuario" icon="user" />
            <app-field [control]="f.email" label="Correo electrónico" icon="mail" kind="email" />
            <view>
              <app-field [control]="f.password" label="Contraseña" icon="lock" kind="password" />
              <text class="hint">Mínimo 8 caracteres, con una letra y un número.</text>
            </view>
            <app-checkbox label="Acepto los Términos y la Política de privacidad" [(checked)]="accepted" />
            @if (error(); as error) {
              <text class="error" accessibilityRole="alert">{{ error }}</text>
            }
          </view>
          <view class="spacer"></view>
          <app-button label="Crear cuenta" [disabled]="busy()" (press)="create()" />
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
      padding: var(--space-2) var(--space-5) var(--space-4);
    }
    .intro {
      align-items: center;
      gap: var(--space-2);
      padding-bottom: var(--space-4);
    }
    .intro-text {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      text-align: center;
    }
    .stack {
      gap: var(--space-3);
    }
    .hint {
      padding-top: var(--space-1);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .error {
      font-size: var(--text-xs);
      color: var(--color-danger);
    }
    .spacer {
      flex: 1;
      min-height: var(--space-5);
    }
  `,
})
export class RegisterPage {
  private readonly nav = inject(NativeNavigation);
  private readonly session = inject(Session);

  protected readonly data = signal({ username: '', email: '', password: '' });
  protected readonly accepted = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly f = form(this.data, (path) => {
    required(path.username);
    minLength(path.username, 3);
    required(path.email);
    email(path.email);
    required(path.password);
    minLength(path.password, 8);
    pattern(path.password, /^(?=.*[A-Za-z])(?=.*\d).+$/);
  });

  protected async create(): Promise<void> {
    this.error.set(null);
    if (!this.accepted()) return void this.error.set('Acepta los términos para crear tu cuenta.');
    await submit(this.f, {
      action: async () => {
        this.busy.set(true);
        const { username, email, password } = this.data();
        const result = await this.session.register(username, email, password);
        this.busy.set(false);
        if (!result.ok) return void this.error.set(result.error);
        const offer = this.session.biometricKind() && !this.session.biometricPrompted();
        await this.nav.reset(offer ? '/enable-biometrics' : '/app');
      },
    });
  }
}
