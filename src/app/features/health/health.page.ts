import { Component, computed, inject, input, resource } from '@angular/core';
import { ScrollView, Text, View } from '@ng-native/components';
import { NativeNavigation } from '@ng-native/router';
import { HealthRepository } from '../../data/health/health.repository.ts';
import type { Vaccine } from '../../domain/models.ts';
import { AppButton } from '../../shared/ui/app-button.ts';
import { AppIcon } from '../../shared/ui/app-icon.ts';
import { AppNavBar } from '../../shared/ui/app-nav-bar.ts';
import { AppScreen } from '../../shared/ui/app-screen.ts';
import { AppSkeleton } from '../../shared/ui/app-skeleton.ts';
import { AppState } from '../../shared/ui/app-state.ts';
import { PlacesStore } from '../places/places.store.ts';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** The health card: what to do next first, then vaccines and weight. It records and reminds; it never diagnoses. */
@Component({
  selector: 'app-health-page',
  imports: [AppButton, AppIcon, AppNavBar, AppScreen, AppSkeleton, AppState, ScrollView, Text, View],
  template: `
    <app-screen>
      <app-nav-bar [title]="record.value() ? 'Salud de ' + record.value()!.petName : 'Salud'" />
      @if (record.isLoading() && !record.hasValue()) {
        <view class="loading">
          <app-skeleton width="100%" [height]="110" [radius]="18" />
          <app-skeleton width="40%" [height]="14" />
          <app-skeleton width="100%" [height]="56" [radius]="14" />
        </view>
      } @else if (record.error() || !record.value()) {
        <app-state icon="shield" title="Aún no hay carnet" message="Cuando registres una vacuna, aparecerá aquí." action="Reintentar" (act)="record.reload()" />
      } @else if (record.value(); as r) {
        <scroll-view class="fill" [contentContainerStyle]="{ paddingBottom: 24 }">
          <view class="next">
            <text class="next-small">Próxima vacuna</text>
            <text class="next-title">{{ r.nextVaccine.name }} · en {{ r.nextVaccine.inDays }} días</text>
            <app-button label="Agendar cita" icon="calendar" variant="accent" (press)="book()" />
          </view>

          <text class="section">Vacunas</text>
          @for (v of r.vaccines; track v.id) {
            <view class="vac">
              <app-icon name="shield" [size]="26" [tone]="v.status === 'ok' ? 'success' : 'danger'" />
              <view class="vac-text">
                <text class="vac-name">{{ v.name }}</text>
                <text class="meta">{{ v.detail }}</text>
              </view>
              <text class="status" [attr.data-status]="v.status">{{ statusOf(v) }}</text>
            </view>
          }

          <text class="section">Peso</text>
          <view class="card" accessibilityRole="image" [accessibilityLabel]="'Peso en los últimos 6 meses: ' + r.weightHistory.join(', ') + ' kilos'">
            <view class="bars">
              @for (bar of bars(); track $index) {
                <view class="bar-col">
                  <view class="bar" [style]="{ height: bar.height }" [attr.data-last]="$last || null"></view>
                  <text class="meta">{{ bar.month }}</text>
                </view>
              }
            </view>
            <text class="meta">{{ kg(r.weightKg) }} kg · {{ delta(r.weightDeltaKg) }} kg este mes</text>
          </view>
        </scroll-view>
      }
    </app-screen>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .fill {
      flex: 1;
    }
    .loading {
      gap: var(--space-3);
      padding: var(--space-4);
    }
    .next {
      gap: var(--space-2);
      margin: var(--space-2) var(--space-4) 0;
      padding: var(--space-4);
      border-radius: 18px;
      background-color: var(--color-primary-container);
    }
    .next-small {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text-muted);
    }
    .next-title {
      font-size: var(--text-lg);
      font-weight: 800;
      color: var(--color-text);
    }
    .section {
      padding: var(--space-4) var(--space-4) var(--space-2);
      font-size: var(--text-md);
      font-weight: 800;
      color: var(--color-text);
    }
    .vac {
      flex-direction: row;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-bottom-width: 1px;
      border-bottom-color: var(--color-border);
    }
    .vac-text {
      flex: 1;
      gap: 2px;
    }
    .vac-name {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--color-text);
    }
    .meta {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }
    .status {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-success);
    }
    .status[data-status='soon'] {
      color: var(--color-danger);
    }
    .card {
      gap: var(--space-2);
      margin: 0 var(--space-4);
      padding: var(--space-4);
      border-width: 1px;
      border-color: var(--color-border);
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
    }
    .bars {
      height: 96px;
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }
    .bar-col {
      flex: 1;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
    .bar {
      width: 18px;
      border-radius: 6px;
      background-color: var(--color-primary-container);
    }
    .bar[data-last] {
      background-color: var(--color-primary);
    }
  `,
})
export class HealthPage {
  private readonly repo = inject(HealthRepository);
  private readonly nav = inject(NativeNavigation);
  private readonly places = inject(PlacesStore);

  /** Bound from the `health/:id` route. */
  readonly id = input.required<string>();

  protected readonly record = resource({
    params: () => this.id(),
    loader: ({ params }) => this.repo.forPet(params),
  });

  /** The weight history as bars: the lowest weight is a short bar, the highest a tall one. */
  protected readonly bars = computed(() => {
    const history = this.record.value()?.weightHistory ?? [];
    const low = Math.min(...history);
    const span = Math.max(...history) - low || 1;
    const month = new Date().getMonth();
    return history.map((value, i) => ({
      height: 24 + ((value - low) / span) * 48,
      month: MONTHS[(month - (history.length - 1 - i) + 12) % 12]!,
    }));
  });

  protected statusOf(vaccine: Vaccine): string {
    return vaccine.status === 'ok' ? 'Al día' : 'Por vencer';
  }

  protected kg(value: number): string {
    return value.toFixed(1).replace('.', ',');
  }

  protected delta(value: number): string {
    return (value >= 0 ? '+' : '−') + Math.abs(value).toFixed(1).replace('.', ',');
  }

  /** Booking is a call to the vet: opens the directory on veterinarians. */
  protected book(): void {
    this.places.kind.set('vet');
    void this.nav.push('/stores');
  }
}
