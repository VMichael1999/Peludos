import type { LostAlert } from '../../domain/models.ts';

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

const KM_PER_DEGREE = 111.32;
/** Where "me" sits on the drawn alerts map, as a percentage of its width and height. */
const ME = { x: 50, y: 54 } as const;

/**
 * Where an alert is on the real map. The sample alerts only know a spot on the drawn map and how
 * far away they are, so each is put that far from `origin`, in the direction its spot lies from the
 * middle of the drawn map: the real map then agrees with the list. Real alerts will carry their
 * own coordinates and this goes away with the samples.
 */
export function alertLocation(origin: Coordinates, alert: Pick<LostAlert, 'pin' | 'distanceKm'>): Coordinates {
  const east = alert.pin.x - ME.x;
  const north = ME.y - alert.pin.y;
  const length = Math.hypot(east, north);
  // An alert at the very centre has no direction: it sits right on the person.
  if (length === 0) return origin;
  const eastKm = (east / length) * alert.distanceKm;
  const northKm = (north / length) * alert.distanceKm;
  return {
    latitude: origin.latitude + northKm / KM_PER_DEGREE,
    longitude: origin.longitude + eastKm / (KM_PER_DEGREE * Math.cos((origin.latitude * Math.PI) / 180)),
  };
}
