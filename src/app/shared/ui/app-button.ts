import { Component, booleanAttribute, computed, input, output } from '@angular/core';
import { Pressable, Text } from '@ng-native/components';
import type { IconName } from '../../core/icons.ts';
import { AppIcon, type Tone } from './app-icon.ts';

export type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'danger';

@Component({
  selector: 'app-button',
  imports: [AppIcon, Pressable, Text],
  template: `
    <pressable
      class="btn"
      accessibilityRole="button"
      [accessibilityLabel]="label()"
      [accessibilityState]="{ disabled: disabled() }"
      [attr.data-variant]="variant()"
      [attr.data-disabled]="disabled() || null"
      [attr.data-compact]="compact() || null"
      [disabled]="disabled()"
      (press)="press.emit()"
    >
      @if (icon(); as icon) {
        <app-icon [name]="icon" [size]="24" [tone]="iconTone()" />
      }
      <text class="label">{{ label() }}</text>
    </pressable>
  `,
  styles: `
    .btn {
      min-height: var(--control-height);
      padding: 0 var(--space-5);
      border-radius: var(--radius-md);
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }
    .btn[data-compact] {
      min-height: 40px;
      padding: 0 var(--space-4);
    }
    .btn:active {
      opacity: 0.85;
    }
    .btn[data-disabled] {
      opacity: 0.5;
    }
    .label {
      font-size: var(--text-md);
      font-weight: 700;
    }
    .btn[data-variant='primary'] {
      background-color: var(--color-primary);
    }
    .btn[data-variant='primary'] .label {
      color: var(--color-on-primary);
    }
    .btn[data-variant='accent'] {
      background-color: var(--color-accent);
    }
    .btn[data-variant='accent'] .label {
      color: var(--color-on-accent);
    }
    .btn[data-variant='danger'] {
      background-color: var(--color-danger);
    }
    .btn[data-variant='danger'] .label {
      color: #ffffff;
    }
    .btn[data-variant='ghost'] {
      border-width: 1.5px;
      border-color: var(--color-border);
    }
    .btn[data-variant='ghost'] .label {
      color: var(--color-primary);
    }
  `,
})
export class AppButton {
  readonly label = input.required<string>();
  readonly variant = input<ButtonVariant>('primary');
  readonly icon = input<IconName>();
  readonly disabled = input(false, { transform: booleanAttribute });
  /** A shorter button, for a bar or a row. */
  readonly compact = input(false, { transform: booleanAttribute });
  readonly press = output<void>();

  protected readonly iconTone = computed<Tone>(() => {
    switch (this.variant()) {
      case 'primary': return 'onPrimary';
      case 'accent': return 'onAccent';
      case 'danger': return 'white';
      case 'ghost': return 'primary';
    }
  });
}
