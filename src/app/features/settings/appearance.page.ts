import { Component, inject } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import { Dialogs } from '@ng-native/device';
import { Storage } from '@ng-native/expo/async-storage';
import { NativeNavigation } from '@ng-native/router';
import { Session } from '../../core/session.ts';
import { type ThemePreference, Theme } from '../../core/theme/theme.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppToggle } from '../../shared/ui/app-toggle.ts';

const THEMES: readonly { readonly id: ThemePreference; readonly label: string; readonly hint?: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
  { id: 'system', label: 'Sistema', hint: 'Sigue la configuración del dispositivo' },
];

@Component({
  selector: 'app-appearance-page',
  imports: [AppIcon, AppNavBar, AppScreen, AppToggle, Pressable, Text, View],
  template: `
    <app-screen>
      <app-nav-bar title="Apariencia" />
      <text class="section">Tema</text>
      <view class="card" accessibilityRole="radiogroup">
        @for (t of themes; track t.id) {
          <pressable
            class="row"
            accessibilityRole="radio"
            [accessibilityLabel]="t.label"
            [accessibilityState]="{ selected: theme.preference() === t.id }"
            (press)="theme.choose(t.id)"
          >
            <view class="grow">
              <text class="label">{{ t.label }}</text>
              @if (t.hint) {
                <text class="hint">{{ t.hint }}</text>
              }
            </view>
            @if (theme.preference() === t.id) {
              <app-icon name="check" [size]="26" tone="primary" />
            }
          </pressable>
        }
      </view>

      <text class="section">Privacidad</text>
      <view class="card">
        <view class="row">
          <view class="grow">
            <text class="label">Cuenta privada</text>
            <text class="hint">Solo tus seguidores ven tus fotos</text>
          </view>
          <app-toggle label="Cuenta privada" [(checked)]="privateAccount" />
        </view>
      </view>

      <text class="section">Cuenta</text>
      <view class="card">
        <pressable class="row" accessibilityRole="button" accessibilityLabel="Cerrar sesión" (press)="signOut()">
          <text class="label">Cerrar sesión</text>
        </pressable>
        <pressable class="row last" accessibilityRole="button" accessibilityLabel="Eliminar mi cuenta" (press)="deleteAccount()">
          <text class="label danger">Eliminar mi cuenta</text>
        </pressable>
      </view>
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .section {
      padding: var(--space-4) var(--space-4) var(--space-2);
      font-size: var(--text-sm);
      font-weight: 800;
      color: var(--color-text-muted);
    }
    .card {
      margin: 0 var(--space-4);
      overflow: hidden;
      border-width: 1px;
      border-color: var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
    }
    .row {
      min-height: 56px;
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-4);
      border-bottom-width: 1px;
      border-bottom-color: var(--color-border);
    }
    .row.last {
      border-bottom-width: 0;
    }
    .grow {
      flex: 1;
      gap: 2px;
    }
    .label {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .label.danger {
      color: var(--color-danger);
    }
    .hint {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
  `,
})
export class AppearancePage {
  private readonly nav = inject(NativeNavigation);
  private readonly session = inject(Session);
  private readonly dialogs = inject(Dialogs);

  protected readonly theme = inject(Theme);
  protected readonly themes = THEMES;
  protected readonly privateAccount = inject(Storage).signal('private-account', false);

  protected async signOut(): Promise<void> {
    this.session.signOut();
    await this.nav.reset('/login');
  }

  /** Account deletion is required by the app stores; it asks first, and says what it removes. */
  protected async deleteAccount(): Promise<void> {
    const confirmed = await this.dialogs.confirm('¿Eliminar tu cuenta?', {
      message: 'Se borrarán tu perfil, tus mascotas y tus publicaciones. No se puede deshacer.',
      confirm: 'Eliminar',
      cancel: 'Cancelar',
      destructive: true,
    });
    if (!confirmed) return;
    this.session.signOut();
    await this.nav.reset('/login');
  }
}
