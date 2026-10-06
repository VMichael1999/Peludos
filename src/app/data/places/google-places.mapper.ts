import type { Place, PlaceKind } from '../../domain/models.ts';

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

/** The part of a Places API (New) place that the app reads: the field mask asks for exactly these. */
export interface GooglePlace {
  readonly id: string;
  readonly displayName?: { readonly text: string };
  readonly location?: Coordinates;
  readonly rating?: number;
  readonly types?: readonly string[];
  readonly shortFormattedAddress?: string;
  readonly nationalPhoneNumber?: string;
  readonly currentOpeningHours?: { readonly openNow?: boolean };
}

export const FIELD_MASK = [
  'places.id', 'places.displayName', 'places.location', 'places.rating', 'places.types',
  'places.shortFormattedAddress', 'places.nationalPhoneNumber', 'places.currentOpeningHours.openNow',
].join(',');

/** Where "me" sits on the drawn map, as a percentage of its width and height. */
export const ME_ON_MAP = { x: 46, y: 58 } as const;

const EARTH_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

/** The kind Google's own types say; `fallback` when they say neither vet nor pet store. */
export function kindOf(types: readonly string[] | undefined, fallback: PlaceKind): PlaceKind {
  if (types?.includes('veterinary_care')) return 'vet';
  if (types?.includes('pet_store')) return 'shop';
  return fallback;
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/**
 * Where a place goes on the drawn map: east is right, north is up, and the search radius spans
 * 40% of the map around "me". The pin stays inside the frame.
 */
export function pinOf(origin: Coordinates, point: Coordinates, radiusKm: number): { x: number; y: number } {
  const east = distanceKm(origin, { latitude: origin.latitude, longitude: point.longitude }) * Math.sign(point.longitude - origin.longitude);
  const north = distanceKm(origin, { latitude: point.latitude, longitude: origin.longitude }) * Math.sign(point.latitude - origin.latitude);
  return {
    x: clamp(ME_ON_MAP.x + (east / radiusKm) * 40, 6, 94),
    y: clamp(ME_ON_MAP.y - (north / radiusKm) * 40, 8, 90),
  };
}

const KIND_LABEL: Record<PlaceKind, string> = { vet: 'Veterinaria', shop: 'Tienda de mascotas', groomer: 'Peluquería' };

/** A Google place as the app's own `Place`, or null when Google gave no position for it. */
export function toPlace(raw: GooglePlace, origin: Coordinates, radiusKm: number, fallbackKind: PlaceKind, forceKind = false): Place | null {
  if (!raw.location || !raw.displayName) return null;
  const kind = forceKind ? fallbackKind : kindOf(raw.types, fallbackKind);
  const openNow = raw.currentOpeningHours?.openNow;
  return {
    id: raw.id,
    name: raw.displayName.text,
    kind,
    tagline: raw.shortFormattedAddress ?? KIND_LABEL[kind],
    distanceKm: distanceKm(origin, raw.location),
    openLabel: openNow === undefined ? 'Horario no disponible' : openNow ? 'Abierto ahora' : 'Cerrado ahora',
    open: openNow === true,
    rating: raw.rating ?? null,
    phone: raw.nationalPhoneNumber ?? '',
    pin: pinOf(origin, raw.location, radiusKm),
  };
}
