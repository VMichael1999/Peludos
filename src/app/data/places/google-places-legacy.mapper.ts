import type { GooglePlace } from './google-places.mapper.ts';

/** The part of a classic Places API (Nearby Search) result that the app reads. */
export interface LegacyPlace {
  readonly place_id: string;
  readonly name?: string;
  readonly geometry?: { readonly location?: { readonly lat: number; readonly lng: number } };
  readonly rating?: number;
  readonly types?: readonly string[];
  readonly vicinity?: string;
  readonly opening_hours?: { readonly open_now?: boolean };
  readonly business_status?: string;
}

/** A classic result in the shape of the new API's, so both go through the same `toPlace`. */
export function fromLegacy(raw: LegacyPlace): GooglePlace | null {
  const location = raw.geometry?.location;
  if (!location || !raw.name || raw.business_status === 'CLOSED_PERMANENTLY') return null;
  return {
    id: raw.place_id,
    displayName: { text: raw.name },
    location: { latitude: location.lat, longitude: location.lng },
    ...(raw.rating === undefined ? {} : { rating: raw.rating }),
    ...(raw.types === undefined ? {} : { types: raw.types }),
    ...(raw.vicinity === undefined ? {} : { shortFormattedAddress: raw.vicinity }),
    ...(raw.opening_hours?.open_now === undefined ? {} : { currentOpeningHours: { openNow: raw.opening_hours.open_now } }),
  };
}

/** The usable places in a classic answer; anything unexpected yields none. */
export function parseLegacy(response: unknown): GooglePlace[] {
  const results = (response as { results?: unknown } | null)?.results;
  if (!Array.isArray(results)) return [];
  return results.flatMap((r: LegacyPlace) => fromLegacy(r) ?? []);
}

/** Whether the answer means "this API is not available to this key", as opposed to "no results". */
export function isRefusal(response: unknown): boolean {
  const status = (response as { status?: string } | null)?.status;
  return status !== undefined && status !== 'OK' && status !== 'ZERO_RESULTS';
}
