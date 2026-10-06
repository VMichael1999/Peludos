import { Component, inject, signal } from '@angular/core';
import { email, form, required, submit } from '@angular/forms/signals';
import { Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { AuthRepository } from '../../data/auth/auth.repository.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppField } from '../../shared/ui/app-field.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';

@Component({
  selector: 'app-recover-page',
  imports: [AppButton, AppField, AppIcon, AppNavBar, AppScreen, Text, View],
  template: `
    <app-screen>
      <app-nav-bar title="Recuperar contraseña" />
      <view class="page">
        @if (sent()) {
          <view class="intro">
            <view class="disc"><app-icon name="mail" [size]="44" tone="primary" [strokeWidth]="1.6" /></view>
            <text class="title">Revisa tu correo</text>
            <text class="message">Te enviamos un enlace a {{ data().email }} para crear una nueva contraseña.</text>
          </view>
          <view class="actions">
            <app-button label="Volver a entrar" (press)="nav.back()" />
          </view>
        } @else {
          <view class="intro">
            <view class="disc"><app-icon name="lock" [size]="44" tone="primary" [strokeWidth]="1.6" /></view>
            <text class="title">¿Olvidaste tu contraseña?</text>
            <text class="message">Escribe tu correo y te enviaremos un enlace para crear una nueva.</text>
          </view>
          <view class="field"><app-field [control]="f.email" label="Correo electrónico" icon="mail" kind="email" /></view>
          @if (error(); as error) {
            <text class="error" accessibilityRole="alert">{{ error }}</text>
          }
          <view class="actions">
            <app-button label="Enviar enlace" [disabled]="busy()" (press)="send()" />
            <app-button label="Volver a entrar" variant="ghost" (press)="nav.back()" />
          </view>
        }
      </view>
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .page {
      flex: 1;
      padding: var(--space-6) var(--space-5) var(--space-4);
    }
    .intro {
      align-items: center;
      gap: var(--space-3);
      padding: 0 var(--space-4);
    }
    .disc {
      width: 104px;
      height: 104px;
      border-radius: 52px;
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
    .field {
      padding-top: var(--space-6);
    }
    .error {
      padding-top: var(--space-2);
      font-size: var(--text-xs);
      color: var(--color-danger);
    }
    .actions {
      margin-top: auto;
      gap: var(--space-2);
    }
  `,
})
export class RecoverPage {
  protected readonly nav = inject(NativeNavigation);
  private readonly auth = inject(AuthRepository);

  protected readonly data = signal({ email: '' });
  protected readonly busy = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly f = form(this.data, (path) => {
    required(path.email);
    email(path.email);
  });

  protected async send(): Promise<void> {
    this.error.set(null);
    await submit(this.f, {
      action: async () => {
        this.busy.set(true);
        const result = await this.auth.sendPasswordReset(this.data().email);
        this.busy.set(false);
        if (result.ok) this.sent.set(true);
        else this.error.set(result.error);
      },
    });
  }
}
