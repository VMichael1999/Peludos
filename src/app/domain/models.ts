/** The things the app is about. Plain data, no framework: this folder imports nothing from Angular. */

export type Species = 'dog' | 'cat';
export type PhotoTone = 'blue' | 'border' | 'warm';

export interface Pet {
  readonly id: string;
  readonly name: string;
  readonly species: Species;
  readonly breed: string;
  readonly ageYears: number;
  readonly ownerName: string;
  readonly bio: string;
  readonly posts: number;
  readonly followers: number;
  readonly following: number;
}

export interface Post {
  readonly id: string;
  readonly petName: string;
  readonly species: Species;
  readonly ownerName: string;
  readonly caption: string;
  readonly minutesAgo: number;
  readonly likes: number;
  readonly comments: number;
  readonly liked: boolean;
  readonly saved: boolean;
  readonly tone: PhotoTone;
  readonly kind: 'photo' | 'reel';
  /** The real photo, when there is one; the card shows its gradient placeholder until then, or without it. */
  readonly photoUrl?: string;
  /** A reel's video, when there is one; the reel shows its dark placeholder until then, or without it. */
  readonly videoUrl?: string;
}

/** A video for the reels feed, whichever service it came from. */
export interface ReelVideo {
  readonly id: string;
  /** Seconds. */
  readonly duration: number;
  /** A still of the video: shown while it loads. */
  readonly thumbnail: string;
  /** What to play. Null for the sample reels, which have no video. */
  readonly videoUrl: string | null;
  readonly width: number;
  readonly height: number;
  /** Who made it. */
  readonly user: string;
  readonly tags: readonly string[];
  readonly views: number;
  readonly likes: number;
}

export interface Story {
  readonly id: string;
  readonly petName: string;
  readonly species: Species;
  readonly mine: boolean;
}

export type AlertStatus = 'lost' | 'found';

export interface Sighting {
  readonly id: string;
  readonly by: string;
  readonly where: string;
  readonly minutesAgo: number;
}

export interface LostAlert {
  readonly id: string;
  readonly petName: string;
  readonly breed: string;
  readonly traits: string;
  readonly lastSeenAt: string;
  /** The owner's contact number, shown on the alert so a neighbour can call. */
  readonly phone: string;
  readonly minutesAgo: number;
  readonly status: AlertStatus;
  readonly distanceKm: number;
  readonly sightings: readonly Sighting[];
  /** Where the pin sits on the map, as a percentage of its width and height. */
  readonly pin: { readonly x: number; readonly y: number };
}

export type PlaceKind = 'vet' | 'shop' | 'groomer';

export interface Place {
  readonly id: string;
  readonly name: string;
  readonly kind: PlaceKind;
  readonly tagline: string;
  readonly distanceKm: number;
  readonly openLabel: string;
  readonly open: boolean;
  /** Null when the source has no rating for it. */
  readonly rating: number | null;
  readonly phone: string;
  readonly pin: { readonly x: number; readonly y: number };
  /** Where it really is. Sample places have none: they only have a spot on the drawn map. */
  readonly location?: { readonly latitude: number; readonly longitude: number };
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly price: number;
}

export type VaccineStatus = 'ok' | 'soon';

export interface Vaccine {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly status: VaccineStatus;
}

export interface HealthRecord {
  readonly petName: string;
  readonly nextVaccine: { readonly name: string; readonly inDays: number };
  readonly vaccines: readonly Vaccine[];
  readonly weightKg: number;
  readonly weightDeltaKg: number;
  /** Weight over the last six months, oldest first, for the chart. */
  readonly weightHistory: readonly number[];
}

export type NotificationKind = 'alert' | 'health' | 'like' | 'follow' | 'comment';

export interface AppNotification {
  readonly id: string;
  readonly kind: NotificationKind;
  readonly who: string;
  readonly text: string;
  readonly minutesAgo: number;
  readonly unread: boolean;
  /** Where tapping it goes, when it points at something: an alert or a health card. */
  readonly target?: string;
}
