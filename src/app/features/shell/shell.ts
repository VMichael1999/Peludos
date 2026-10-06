import { Component, computed, inject, signal } from '@angular/core';
import { View } from '@ng-native/components';
import { Session } from '../../core/session.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppTabBar, type TabId } from '../../shared/ui/app-tab-bar.ts';
import { AlertsPage } from '../alerts/alerts.page.ts';
import { AlertsStore } from '../alerts/alerts.store.ts';
import { HomePage } from '../feed/home.page.ts';
import { ExplorePage } from '../explore/explore.page.ts';
import { ProfilePage } from '../profile/profile.page.ts';
import { ReelsPage } from '../reels/reels.page.ts';

/**
 * The five tabs. The tab is a signal, not a route, so switching never pushes a screen; each tab
 * stays mounted (hidden) so it keeps its scroll position. The bar is drawn by the app, not the
 * system, to carry the icon set and the profile photo.
 */
@Component({
  selector: 'app-shell',
  imports: [AlertsPage, AppScreen, AppTabBar, ExplorePage, HomePage, ProfilePage, ReelsPage, View],
  template: `
    <app-screen [edges]="['top']">
      <view class="tabs">
        <view class="tab" [style]="show('home')"><app-home-page /></view>
        <view class="tab" [style]="show('reels')"><app-reels-page [active]="tab() === 'reels'" /></view>
        <view class="tab" [style]="show('search')"><app-explore-page /></view>
        <view class="tab" [style]="show('alerts')"><app-alerts-page /></view>
        <view class="tab" [style]="show('me')"><app-profile-page /></view>
      </view>
      <app-tab-bar
        [active]="tab()"
        [over]="tab() === 'reels'"
        [alertDot]="hasNearbyAlert()"
        [initial]="initial()"
        (select)="tab.set($event)"
      />
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .tabs {
      flex: 1;
    }
    .tab {
      flex: 1;
    }
  `,
})
export class Shell {
  private readonly session = inject(Session);
  private readonly alerts = inject(AlertsStore);

  protected readonly tab = signal<TabId>('home');
  protected readonly hasNearbyAlert = computed(() => this.alerts.nearest() !== undefined);
  protected readonly initial = computed(() => (this.session.user()?.username ?? 'L').charAt(0).toUpperCase());

  protected show(id: TabId) {
    return this.tab() === id ? { flex: 1, display: 'flex' as const } : { flex: 1, display: 'none' as const };
  }
}
