import { Component, computed, inject, input } from '@angular/core';
import { NgIcon } from '@ng-native/icons';
import { type IconName, iconSvg } from '../../core/icons.ts';
import { Theme } from '../../core/theme/theme.ts';

export type Tone =
  | 'text' | 'muted' | 'primary' | 'primaryContainer' | 'onPrimary' | 'accent' | 'onAccent' | 'danger' | 'success' | 'white';

/** One icon from the app's set, coloured by a palette role so it follows the light/dark theme. */
@Component({
  selector: 'app-icon',
  imports: [NgIcon],
  template: `<ng-icon [svg]="markup()" [size]="size()" [color]="color()" [accessibilityLabel]="label()" />`,
  styles: `
    :host {
      flex: none;
    }
  `,
})
export class AppIcon {
  private readonly theme = inject(Theme);

  readonly name = input.required<IconName>();
  readonly size = input(28);
  readonly tone = input<Tone>('text');
  readonly strokeWidth = input(1.8);
  /** A palette role to fill the shapes with, such as the active tab's soft blue. */
  readonly fillTone = input<Tone | null>(null);
  /** Set when the icon alone carries the meaning; otherwise it is left out of the accessibility tree. */
  readonly label = input<string>();

  protected readonly color = computed(() => this.resolve(this.tone()));
  protected readonly markup = computed(() => {
    const fillTone = this.fillTone();
    return iconSvg(this.name(), {
      strokeWidth: this.strokeWidth(),
      fill: fillTone ? this.resolve(fillTone) : 'none',
    });
  });

  private resolve(tone: Tone): string {
    const p = this.theme.palette();
    switch (tone) {
      case 'text': return p.text;
      case 'muted': return p.textMuted;
      case 'primary': return p.primary;
      case 'primaryContainer': return p.primaryContainer;
      case 'onPrimary': return p.onPrimary;
      case 'accent': return p.accent;
      case 'onAccent': return p.onAccent;
      case 'danger': return p.danger;
      case 'success': return p.success;
      case 'white': return '#FFFFFF';
    }
  }
}
