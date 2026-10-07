import { Component, computed, input, output, viewChild } from '@angular/core';
import { MapView, type MapCircle, type MapMarker } from '@ng-native/expo/map-view';
import type { AlertStatus } from '../../domain/models.ts';
import { zoomFor } from './places-camera.ts';

export interface AlertOnMap {
  readonly id: string;
  readonly petName: string;
  readonly status: AlertStatus;
  readonly location: { readonly latitude: number; readonly longitude: number };
}

/** Apple's marker look for each status: red for a lost pet, green for a found one. */
const LOOK: Record<AlertStatus, { tintColor: string; systemImage: string }> = {
  lost: { tintColor: '#dc2626', systemImage: 'exclamationmark.triangle.fill' },
  found: { tintColor: '#16a34a', systemImage: 'checkmark.circle.fill' },
};

/**
 * The real map for alerts: Apple Maps on iOS and Google Maps on Android, through `expo-maps`. It
 * shows the person, the radius they are warned within, and a marker per alert; a tap on a marker
 * says which. Like `app-places-map` it cannot run in Expo Go.
 */
@Component({
  selector: 'app-alerts-map',
  imports: [MapView],
  template: `
    <expo-map
      [style]="{ height: height() }"
      [markers]="markers()"
      [circles]="circles()"
      [cameraPosition]="camera()"
      [properties]="{ isMyLocationEnabled: true }"
      [uiSettings]="{ myLocationButtonEnabled: false }"
      (markerClick)="pick.emit($event.nativeEvent.id ?? '')"
    />
  `,
})
export class AppAlertsMap {
  readonly alerts = input.required<readonly AlertOnMap[]>();
  /** Where the person is: the middle of the map and of the warning radius. */
  readonly origin = input.required<{ readonly latitude: number; readonly longitude: number }>();
  readonly radiusKm = input(3);
  readonly height = input(250);
  /** The id of the alert whose marker was tapped. */
  readonly pick = output<string>();

  private readonly map = viewChild.required(MapView);

  protected readonly camera = computed(() => this.target());
  protected readonly markers = computed<MapMarker[]>(() =>
    this.alerts().map((a) => ({ id: a.id, title: a.petName, coordinates: a.location, ...LOOK[a.status] })),
  );
  protected readonly circles = computed<MapCircle[]>(() => [
    { center: this.origin(), radius: this.radiusKm() * 1000, color: 'rgba(220, 38, 38, 0.08)', lineColor: 'rgba(220, 38, 38, 0.55)', lineWidth: 1 },
  ]);

  /** Brings the camera back to the person, as the locate button asks. */
  recenter(): void {
    void this.map().setCameraPosition(this.target());
  }

  private target() {
    const origin = this.origin();
    return { coordinates: origin, zoom: zoomFor(this.radiusKm() * 2 * 1.15, origin.latitude) };
  }
}
