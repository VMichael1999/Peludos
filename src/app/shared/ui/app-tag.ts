import { Component, input } from '@angular/core';
import { Text, View } from '@ng-native/components';

export type TagKind = 'danger' | 'success' | 'accent';

/** A small status label: "Perdido hace 25 min", "¡Encontrado!". */
@Component({
  selector: 'app-tag',
  imports: [Text, View],
  template: `
    <view class="tag" [attr.data-kind]="kind()"><text class="label">{{ label() }}</text></view>
  `,
  styles: `
    :host {
      align-self: flex-start;
    }
    .tag {
      padding: 3px var(--space-2);
      border-radius: 8px;
    }
    .label {
      font-size: var(--text-xs);
      font-weight: 700;
    }
    .tag[data-kind='danger'] {
      background-color: var(--color-danger-container);
    }
    .tag[data-kind='danger'] .label {
      color: var(--color-danger);
    }
    .tag[data-kind='success'] {
      background-color: var(--color-success-container);
    }
    .tag[data-kind='success'] .label {
      color: var(--color-success);
    }
    .tag[data-kind='accent'] {
      background-color: var(--color-accent-container);
    }
    .tag[data-kind='accent'] .label {
      color: var(--color-text);
    }
  `,
})
export class AppTag {
  readonly label = input.required<string>();
  readonly kind = input<TagKind>('danger');
}
