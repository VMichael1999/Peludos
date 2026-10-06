import { Component, input, output } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import type { Pet } from '../../domain/models.ts';
import { AppAvatar } from './app-avatar.ts';

/** "Which pet?": a row of pills, one per pet, with the chosen one marked. */
@Component({
  selector: 'app-pet-picker',
  imports: [AppAvatar, Pressable, Text, View],
  template: `
    <view class="pets" accessibilityRole="radiogroup">
      @for (pet of pets(); track pet.id) {
        <pressable
          class="pet"
          accessibilityRole="radio"
          [accessibilityLabel]="pet.name"
          [accessibilityState]="{ selected: selectedId() === pet.id }"
          [attr.data-selected]="selectedId() === pet.id || null"
          (press)="choose.emit(pet.id)"
        >
          <app-avatar [name]="pet.name" [size]="32" />
          <text class="name">{{ pet.name }}</text>
        </pressable>
      }
    </view>
  `,
  styles: `
    .pets {
      flex-direction: row;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .pet {
      min-height: var(--tap-target);
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
      padding: 0 var(--space-4) 0 var(--space-2);
      border-width: 1.5px;
      border-color: var(--color-border);
      border-radius: var(--radius-pill);
      background-color: var(--color-surface);
    }
    .pet[data-selected] {
      border-color: var(--color-primary);
      background-color: var(--color-primary-container);
    }
    .name {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
  `,
})
export class AppPetPicker {
  readonly pets = input.required<readonly Pet[]>();
  readonly selectedId = input<string | null>(null);
  readonly choose = output<string>();
}
