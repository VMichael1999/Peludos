/**
 * The brand palette as plain values, for the few places that need a colour in JavaScript rather
 * than in CSS (a placeholder colour, a switch tint). The CSS custom properties in `app.ts` are the
 * source of truth for styling; `palette.test.ts` fails if the two ever drift apart.
 * Contrast ratios were measured, not eyeballed: see docs/plan-de-accion.md, section 5.1.
 */
export type SchemeName = 'light' | 'dark';

export interface Palette {
  readonly bg: string;
  readonly surface: string;
  readonly surface2: string;
  readonly primary: string;
  readonly onPrimary: string;
  readonly primaryContainer: string;
  readonly accent: string;
  readonly onAccent: string;
  readonly text: string;
  readonly textMuted: string;
  readonly border: string;
  readonly danger: string;
  readonly success: string;
}

export const PALETTE: Record<SchemeName, Palette> = {
  light: {
    bg: '#F6F8FC',
    surface: '#FFFFFF',
    surface2: '#EEF2FA',
    primary: '#1F4FA3',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DCE6F8',
    accent: '#F2A93B',
    onAccent: '#1A1204',
    text: '#0E1626',
    textMuted: '#5B6784',
    border: '#D9E0EE',
    danger: '#C93636',
    success: '#177A4C',
  },
  dark: {
    bg: '#0B1220',
    surface: '#121C30',
    surface2: '#1A2742',
    primary: '#8DB2F5',
    onPrimary: '#0B1220',
    primaryContainer: '#203A6B',
    accent: '#F5B650',
    onAccent: '#1A1204',
    text: '#E9EFFB',
    textMuted: '#9AA7C4',
    border: '#263553',
    danger: '#FF7A7A',
    success: '#4CC38A',
  },
};
