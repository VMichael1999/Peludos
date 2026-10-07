import { Component, computed, input, output } from '@angular/core';
import { MapView, type MapMarker } from '@ng-native/expo/map-view';
import type { Place } from '../../domain/models.ts';
import { cameraFor } from './places-camera.ts';

/** Apple's marker look for each kind: a colour and an SF Symbol, so the kinds read apart at a glance. */
const LOOK: Record<Place['kind'], { tintColor: string; systemImage: string }> = {
  vet: { tintColor: '#1d4ed8', systemImage: 'cross.case.fill' },
  shop: { tintColor: '#d97706', systemImage: 'bag.fill' },
  groomer: { tintColor: '#16a34a', systemImage: 'scissors' },
};

/**
 * The real map: Apple Maps on iOS and Google Maps on Android, through `expo-maps`. It shows the
 * places that have coordinates and the person's own position, and says which marker was tapped.
 * It cannot run in Expo Go, which does not include the module; the drawn `app-map-surface` is
 * what shows when the places have no coordinates.
 */
@Component({
  selector: 'app-places-map',
  imports: [MapView],
  template: `
    <expo-map
      [style]="{ height: height() }"
      [markers]="markers()"
      [cameraPosition]="camera()"
      [properties]="{ isMyLocationEnabled: true }"
      [uiSettings]="{ myLocationButtonEnabled: false }"
      (markerClick)="pick.emit($event.nativeEvent.id ?? '')"
    />
  `,
})
export class AppPlacesMap {
  readonly places = input.required<readonly Place[]>();
  readonly height = input(150);
  /** The id of the place whose marker was tapped. */
  readonly pick = output<string>();

  protected readonly camera = computed(() => cameraFor(this.places()) ?? undefined);
  protected readonly markers = computed<MapMarker[]>(() =>
    this.places().flatMap((p) => (p.location ? [{ id: p.id, title: p.name, coordinates: p.location, ...LOOK[p.kind] }] : [])),
  );
}
