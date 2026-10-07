import type { Place } from '../../domain/models.ts';

export interface Camera {
  readonly coordinates: { readonly latitude: number; readonly longitude: number };
  readonly zoom: number;
}

const KM_PER_DEGREE = 111.32;
/** A map the width of a phone screen shows about this many tiles across. */
const TILES_ACROSS = 1.56;
const EQUATOR_KM = 40075;

/**
 * Where to point the camera so every place with coordinates is in view: the middle of their
 * bounding box, zoomed to the wider side of it with a margin so pins do not sit on the edge.
 * Null when none has coordinates, which is when the drawn map is shown instead.
 */
export function cameraFor(places: readonly Place[]): Camera | null {
  const points = places.flatMap((p) => (p.location ? [p.location] : []));
  if (!points.length) return null;

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const latitude = (Math.min(...lats) + Math.max(...lats)) / 2;
  const longitude = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  const northSouthKm = (Math.max(...lats) - Math.min(...lats)) * KM_PER_DEGREE;
  const eastWestKm = (Math.max(...lngs) - Math.min(...lngs)) * KM_PER_DEGREE * Math.cos((latitude * Math.PI) / 180);
  const widthKm = Math.max(northSouthKm, eastWestKm, 0.4) * 1.5;

  const zoom = Math.log2((EQUATOR_KM * Math.cos((latitude * Math.PI) / 180) * TILES_ACROSS) / widthKm);
  return { coordinates: { latitude, longitude }, zoom: Math.min(17, Math.max(10, Math.round(zoom * 10) / 10)) };
}
