import { Component, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { Pressable, TextInput, View } from '@ng-native/components';
import type { IconName } from '../../core/icons.ts';
import { Theme } from '../../core/theme/theme.ts';
import { AppIcon } from './app-icon.ts';

export type FieldKind = 'text' | 'email' | 'password' | 'phone' | 'multiline';

/**
 * A labelled-by-placeholder text field with a leading icon, bound to a Signal Forms field. A
 * password field gets its own show/hide toggle. The border turns red once the field is touched
 * and invalid, through the `data-invalid` / `data-touched` attributes the control publishes.
 */
@Component({
  selector: 'app-field',
  imports: [AppIcon, FormField, Pressable, TextInput, View],
  template: `
    <view class="field" [attr.data-multiline]="kind() === 'multiline' || null" [attr.data-invalid]="showError() || null">
      @if (icon(); as icon) {
        <app-icon [name]="icon" [size]="24" tone="muted" />
      }
      <text-input
        class="input"
        [accessibilityLabel]="label()"
        [placeholder]="placeholder() || label()"
        [placeholderTextColor]="theme.palette().textMuted"
        [selectionColor]="theme.palette().primary"
        [keyboardType]="keyboardType()"
        [secureTextEntry]="kind() === 'password' && !revealed()"
        [autoCapitalize]="kind() === 'text' || kind() === 'multiline' ? 'sentences' : 'none'"
        [autoCorrect]="kind() === 'text' || kind() === 'multiline'"
        [textContentType]="textContentType()"
        [multiline]="kind() === 'multiline'"
        [formField]="control()"
      />
      @if (kind() === 'password') {
        <pressable
          class="reveal"
          accessibilityRole="button"
          [accessibilityLabel]="revealed() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          (press)="revealed.set(!revealed())"
        >
          <app-icon [name]="revealed() ? 'eyeOff' : 'eye'" [size]="24" tone="muted" />
        </pressable>
      }
    </view>
  `,
  styles: `
    .field {
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
    .field[data-invalid] {
      border-color: var(--color-danger);
    }
    .field[data-multiline] {
      align-items: flex-start;
      padding-top: var(--space-3);
      min-height: 92px;
    }
    .input {
      flex: 1;
      padding: 0;
      font-size: var(--text-md);
      color: var(--color-text);
    }
    .reveal {
      width: var(--tap-target);
      height: var(--tap-target);
      margin-right: -12px;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class AppField {
  protected readonly theme = inject(Theme);

  readonly control = input.required<FieldTree<string>>();
  readonly label = input.required<string>();
  readonly placeholder = input<string>();
  readonly icon = input<IconName>();
  readonly kind = input<FieldKind>('text');
  readonly multiline = input(false, { transform: booleanAttribute });

  protected readonly revealed = signal(false);
  /** Red only once the person has been at the field (or tried to submit) and it is still wrong. */
  protected readonly showError = computed(() => {
    const state = this.control()();
    return state.touched() && state.invalid();
  });
  protected readonly keyboardType = computed(() => {
    switch (this.kind()) {
      case 'email': return 'email-address' as const;
      case 'phone': return 'phone-pad' as const;
      default: return 'default' as const;
    }
  });
  protected readonly textContentType = computed(() => {
    switch (this.kind()) {
      case 'email': return 'emailAddress';
      case 'password': return 'password';
      case 'phone': return 'telephoneNumber';
      default: return undefined;
    }
  });
}
