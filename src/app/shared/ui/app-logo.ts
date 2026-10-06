import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-native/icons';
import { LOGO_MARK_SVG } from '../../core/icons.ts';

/** The Peludos mark, at any size. */
@Component({
  selector: 'app-logo',
  imports: [NgIcon],
  template: `<ng-icon [svg]="mark" [size]="size()" accessibilityLabel="Peludos" />`,
  styles: `
    :host {
      flex: none;
    }
  `,
})
export class AppLogo {
  protected readonly mark = LOGO_MARK_SVG;
  readonly size = input(36);
}
