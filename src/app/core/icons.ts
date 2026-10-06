/**
 * The app's icon set: one family, one stroke weight, as in the screen mockups (docs/pantallas.html).
 * Each entry is the inside of a 24x24 SVG; `iconSvg()` wraps it. Colour comes from the icon's
 * `color` (currentColor), so an icon follows the text colour around it.
 */
export type IconName =
  | 'home' | 'reels' | 'search' | 'alert' | 'bell' | 'plus' | 'chat' | 'heart' | 'send' | 'bookmark'
  | 'more' | 'back' | 'pulse' | 'bag' | 'camera' | 'paw' | 'check' | 'shield' | 'calendar' | 'moon'
  | 'locate' | 'grid' | 'wifiOff' | 'phone' | 'eye' | 'eyeOff' | 'faceId' | 'mail' | 'lock' | 'user'
  | 'navigate' | 'chevronRight' | 'close';

const PATHS: Record<IconName, string> = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  reels: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M10 8.5v7l6-3.5z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  alert: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><path d="M12 7.5v3.2M12 13.2v.1"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/>',
  heart: '<path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z"/>',
  send: '<path d="M21 3 3 10.5l7 2.5 2.5 7z"/><path d="m10 13 4-4"/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  pulse: '<path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z"/><path d="M7 12h2l1.5-2.5L13 14l1.5-2H17"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
  camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  paw: '<circle cx="7" cy="10" r="1.8"/><circle cx="10.5" cy="6" r="1.8"/><circle cx="14.5" cy="6" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M12.5 11.5c3 0 5 3 4 5.5-.8 2-3 1.5-4 1.2-1 .3-3.2.8-4-1.2-1-2.5 1-5.5 4-5.5z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  wifiOff: '<path d="M3 9a14 14 0 0 1 18 0M6 12.5a9.5 9.5 0 0 1 12 0M9 16a5 5 0 0 1 6 0"/><path d="M12 19.5v.1"/><path d="m4 4 16 16"/>',
  phone: '<path d="M6 3h4l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2L21 14v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a16.6 16.6 0 0 1-3 3.7M6.4 7.4C3.7 9.1 2.5 12 2.5 12S6 18 12 18c1.4 0 2.6-.3 3.7-.8"/><path d="M9.9 10a3 3 0 0 0 4.1 4.1"/>',
  faceId: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 10v1.5M15 10v1.5M12 10v3h-1M9 15.5c1.8 1.6 4.2 1.6 6 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
  navigate: '<path d="M12 3 5 20l7-4 7 4z"/>',
  chevronRight: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
};

export interface IconOptions {
  readonly strokeWidth?: number;
  /** A fill for the shapes, such as a `var(--token)` for an active tab. */
  readonly fill?: string;
}

export function iconSvg(name: IconName, options: IconOptions = {}): string {
  const { strokeWidth = 1.8, fill = 'none' } = options;
  return (
    `<svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${strokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`
  );
}

/** The Peludos mark: a friendly face on the brand blue. Fixed colours, so it needs no `color`. */
export const LOGO_MARK_SVG =
  '<svg viewBox="0 0 512 512">' +
  '<rect width="512" height="512" rx="120" fill="#1F4FA3"/>' +
  '<ellipse cx="128" cy="236" rx="52" ry="92" transform="rotate(22 128 236)" fill="#F2A93B"/>' +
  '<ellipse cx="384" cy="236" rx="52" ry="92" transform="rotate(-22 384 236)" fill="#F2A93B"/>' +
  '<circle cx="256" cy="278" r="150" fill="#FFFFFF"/>' +
  '<circle cx="204" cy="262" r="22" fill="#1F4FA3"/><circle cx="308" cy="262" r="22" fill="#1F4FA3"/>' +
  '<path d="M226 318C226 304 240 298 256 298C272 298 286 304 286 318C286 336 270 344 256 356C242 344 226 336 226 318Z" fill="#1F4FA3"/>' +
  '<path d="M256 356V374M228 386C240 394 252 392 256 374C260 392 272 394 284 386" fill="none" stroke="#1F4FA3" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';
