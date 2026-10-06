import { Component, booleanAttribute, input, output } from '@angular/core';
import { Pressable, Text } from '@ng-native/components';

@Component({
  selector: 'app-chip',
  imports: [Pressable, Text],
  template: `
    <pressable
      class="chip"
      accessibilityRole="button"
      [accessibilityLabel]="label()"
      [accessibilityState]="{ selected: selected() }"
      [attr.data-selected]="selected() || null"
      (press)="press.emit()"
    >
      <text class="label">{{ label() }}</text>
    </pressable>
  `,
  styles: `
    .chip {
      min-height: 40px;
      padding: 0 var(--space-4);
      border-radius: var(--radius-pill);
      background-color: var(--color-surface-2);
      align-items: center;
      justify-content: center;
    }
    .chip[data-selected] {
      background-color: var(--color-primary);
    }
    .label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
    }
    .chip[data-selected] .label {
      color: var(--color-on-primary);
    }
  `,
})
export class AppChip {
  readonly label = input.required<string>();
  readonly selected = input(false, { transform: booleanAttribute });
  readonly press = output<void>();
}
