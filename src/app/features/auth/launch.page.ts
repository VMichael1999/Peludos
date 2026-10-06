import { Component, inject } from '@angular/core';
import { View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { Session } from '../../core/session.ts';
import { AppLogo } from '../../shared/ui/app-logo.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';

/** The first route: shows the logo while the saved session is checked, then goes to Inicio or the login. */
@Component({
  selector: 'app-launch-page',
  imports: [AppLogo, AppScreen, View],
  template: `
    <app-screen>
      <view class="center"><app-logo [size]="96" /></view>
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .center {
      flex: 1;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class LaunchPage {
  constructor() {
    const nav = inject(NativeNavigation);
    const session = inject(Session);
    void session.restore().then((signedIn) => nav.reset(signedIn ? '/app' : '/login'));
  }
}
