/** "hace 25 min", "hace 2 h", "ayer": how long ago, the way a person says it. */
export function ago(minutes: number): string {
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'ayer' : `hace ${days} días`;
}

/** 1.2 -> "1,2 km", 0.6 -> "600 m". */
export function distance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

/** 48.9 -> "48,90". */
export function price(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

/** 2400 -> "2,4 mil", 128 -> "128". */
export function compact(value: number): string {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1).replace('.', ',').replace(',0', '')} mil`;
}

/** 4.8 -> "4,8 ★"; no rating -> "". */
export function stars(rating: number | null): string {
  return rating === null || rating === 0 ? '' : `${rating.toFixed(1).replace('.', ',')} ★`;
}
