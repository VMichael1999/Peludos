import { Component, inject, signal } from '@angular/core';
import { email, form, minLength, required, submit } from '@angular/forms/signals';
import { Pressable, ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { APP_DESCRIPTION, APP_NAME } from '../../core/brand.ts';
import { Session } from '../../core/session.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppCheckbox } from '../../shared/ui/app-checkbox.ts';
import { AppField } from '../../shared/ui/app-field.ts';
import { AppLogo } from '../../shared/ui/app-logo.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';

@Component({
  selector: 'app-login-page',
  imports: [AppButton, AppCheckbox, AppField, AppLogo, AppScreen, Pressable, ScrollView, Text, View],
  template: `
    <app-screen>
      <scroll-view class="scroll" [contentContainerStyle]="{ flexGrow: 1 }" keyboardShouldPersistTaps="handled">
        <view class="page">
          <view class="brand">
            <app-logo [size]="96" />
            <text class="word">{{ name }}</text>
            <text class="description">{{ description }}</text>
          </view>

          <view class="stack">
            <app-field [control]="f.email" label="Correo electrónico" icon="mail" kind="email" />
            <app-field [control]="f.password" label="Contraseña" icon="lock" kind="password" />
            @if (error(); as error) {
              <text class="error" accessibilityRole="alert">{{ error }}</text>
            }
            <view class="links">
              <app-checkbox label="Recordarme" [(checked)]="remember" />
              <pressable accessibilityRole="link" class="link-hit" (press)="nav.push('/recover')">
                <text class="link">¿Olvidaste tu contraseña?</text>
              </pressable>
            </view>
            <app-button label="Entrar" [disabled]="busy()" (press)="signIn()" />
            @if (session.biometricEnabled() && session.biometricKind(); as kind) {
              <app-button
                [label]="kind === 'face' ? 'Entrar con Face ID' : 'Entrar con tu huella'"
                variant="ghost"
                [icon]="kind === 'face' ? 'faceId' : 'user'"
                (press)="signInWithBiometrics()"
              />
            }
            <view class="or"><view class="rule"></view><text class="or-text">o</text><view class="rule"></view></view>
            <view class="social">
              <app-button class="grow" label="Google" variant="ghost" (press)="notYet()" />
              <app-button class="grow" label="Apple" variant="ghost" (press)="notYet()" />
            </view>
          </view>

          <view class="footer">
            <text class="muted">¿Aún no tienes cuenta?</text>
            <pressable accessibilityRole="link" class="link-hit" (press)="nav.push('/register')">
              <text class="link">Crear cuenta</text>
            </pressable>
          </view>
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
      padding: 0 var(--space-5) var(--space-4);
    }
    .brand {
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-6) var(--space-2);
    }
    .word {
      font-size: var(--text-3xl);
      font-weight: 800;
      letter-spacing: -1px;
      color: var(--color-primary);
    }
    .description {
      max-width: 300px;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      text-align: center;
    }
    .stack {
      gap: var(--space-3);
    }
    .error {
      font-size: var(--text-xs);
      color: var(--color-danger);
    }
    .links {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .link-hit {
      min-height: var(--tap-target);
      justify-content: center;
    }
    .link {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-primary);
    }
    .or {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
    }
    .rule {
      flex: 1;
      height: 1px;
      background-color: var(--color-border);
    }
    .or-text {
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-muted);
    }
    .social {
      flex-direction: row;
      gap: var(--space-2);
    }
    .grow {
      flex: 1;
    }
    .footer {
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding-top: var(--space-3);
    }
    .muted {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
  `,
})
export class LoginPage {
  protected readonly nav = inject(NativeNavigation);
  protected readonly session = inject(Session);
  protected readonly name = APP_NAME;
  protected readonly description = APP_DESCRIPTION;

  /** In a development build the demo account is prefilled; a release build starts empty. */
  private readonly demoEmail = typeof ngDevMode !== 'undefined' && ngDevMode ? 'lucia@peludos.app' : '';
  protected readonly data = signal({ email: this.session.rememberedEmail() || this.demoEmail, password: '' });
  protected readonly remember = signal(this.session.rememberMe());
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly f = form(this.data, (path) => {
    required(path.email);
    email(path.email);
    required(path.password);
    minLength(path.password, 8);
  });

  protected async signIn(): Promise<void> {
    this.error.set(null);
    await submit(this.f, {
      action: async () => {
        this.busy.set(true);
        const result = await this.session.signIn(this.data().email, this.data().password, this.remember());
        this.busy.set(false);
        if (!result.ok) return void this.error.set(result.error);
        await this.enter();
      },
    });
  }

  protected async signInWithBiometrics(): Promise<void> {
    this.error.set(null);
    const result = await this.session.signInWithBiometrics();
    if (!result.ok) return void this.error.set(result.error);
    await this.nav.reset('/app');
  }

  protected notYet(): void {
    this.error.set('Este acceso estará disponible pronto.');
  }

  /** After a first sign-in on a device that can do it, offer quick sign-in once. */
  private async enter(): Promise<void> {
    const offer = this.session.biometricKind() && !this.session.biometricPrompted();
    await this.nav.reset(offer ? '/enable-biometrics' : '/app');
  }
}
