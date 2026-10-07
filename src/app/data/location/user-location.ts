import { Injectable, inject, signal } from '@angular/core';
import { Location } from '@ng-native/expo/location';
import { LIVE_DATA } from '../../core/config.ts';
import type { Coordinates } from '../alerts/alert-location.ts';

/**
 * Where the person is, asked of the device once. Screens with a real map read `here`: until the
 * device answers, and always in tests, which never reach for the location, it is null and they
 * keep their drawn map.
 */
@Injectable({ providedIn: 'root' })
export class UserLocation {
  private readonly position = signal<Coordinates | null>(null);
  readonly here = this.position.asReadonly();

  constructor() {
    if (!inject(LIVE_DATA)) return;
    void inject(Location)
      .current('balanced')
      .then((p) => p && this.position.set({ latitude: p.latitude, longitude: p.longitude }));
  }
}
