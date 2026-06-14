// Design tokens for VerseBite — warm ivory/gold iOS-style palette.
// Ports the CSS-variable system from the prototype (vb-app.jsx buildVars)
// into a flat, strongly-typed theme object with a runtime color-mix helper.

import { Platform, TextStyle } from 'react-native';

// ── color-mix(in srgb, a X%, b) equivalent ──────────────────────────────
type RGBA = { r: number; g: number; b: number; a: number };

function parse(color: string): RGBA {
  const c = color.trim();
  if (c.startsWith('#')) {
    const hex = c.slice(1);
    const full = hex.length === 3 ? hex.split('').map((x) => x + x).join('') : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

function toRGBA({ r, g, b, a }: RGBA): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

/** color-mix in sRGB: `pct`% of `a`, rest `b`. */
export function mix(a: string, b: string, pct: number): string {
  const A = parse(a);
  const B = parse(b);
  const w = pct / 100;
  return toRGBA({
    r: A.r * w + B.r * (1 - w),
    g: A.g * w + B.g * (1 - w),
    b: A.b * w + B.b * (1 - w),
    a: A.a * w + B.a * (1 - w),
  });
}

/** Apply an alpha to any color (overrides existing alpha). */
export function alpha(color: string, a: number): string {
  const c = parse(color);
  return toRGBA({ ...c, a });
}

// ── palette presets ─────────────────────────────────────────────────────
const ACCENT = { gold: '#C9A45C', inkL: '#A8762F', inkD: '#D8B978' };
const IVORY = { bg: '#F3EADB', card: '#FBF6EE', fill: 'rgba(168,118,47,0.09)', hair: 'rgba(58,47,40,0.12)' };
const DARK = { bg: '#171411', card: '#221C18', fill: 'rgba(210,179,111,0.12)', hair: 'rgba(244,233,216,0.13)' };

export const GOLD_DEEP = '#8A6A3E'; // gradient companion used throughout

// ── fonts ────────────────────────────────────────────────────────────────
// English serif → bundled Cormorant Garamond (per-weight families).
// Korean & UI → system font (renders Hangul; the custom serif lacks glyphs).
export const SERIF: Record<number, string> = {
  400: 'CormorantGaramond_400Regular',
  500: 'CormorantGaramond_500Medium',
  600: 'CormorantGaramond_600SemiBold',
};

export function serifFamily(weight: 400 | 500 | 600 = 500): string {
  return SERIF[weight] ?? SERIF[500];
}

// UI/system family (undefined → platform default)
export const UI_FONT = Platform.select({ ios: undefined, default: undefined });

export type Theme = ReturnType<typeof buildTheme>;

export function buildTheme(dark: boolean) {
  const w = dark ? DARK : IVORY;
  const gold = ACCENT.gold;
  const goldInk = dark ? ACCENT.inkD : ACCENT.inkL;
  const labelPrimary = dark ? '#F4E9D8' : '#25221F';
  const labelSecondary = dark ? 'rgba(244,233,216,0.62)' : 'rgba(58,47,40,0.62)';
  const labelTertiary = dark ? 'rgba(244,233,216,0.34)' : 'rgba(58,47,40,0.34)';
  const separator = dark ? 'rgba(244,233,216,0.13)' : 'rgba(58,47,40,0.12)';

  const shadow = dark
    ? { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 14 }, elevation: 12 }
    : { shadowColor: '#3A2A18', shadowOpacity: 0.13, shadowRadius: 17, shadowOffset: { width: 0, height: 10 }, elevation: 6 };
  const shadowSm = dark
    ? { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 4 }
    : { shadowColor: '#3A2A18', shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 2 };

  return {
    dark,
    radius: 24,
    bg: w.bg,
    card: w.card,
    fill: w.fill,
    hair: w.hair,
    gold,
    goldInk,
    goldDeep: GOLD_DEEP,
    labelPrimary,
    labelSecondary,
    labelTertiary,
    separator,
    sysRed: '#D64541',
    shadow,
    shadowSm,
  };
}

// shared serif text helper
export function serif(weight: 400 | 500 | 600, size: number, color: string): TextStyle {
  return { fontFamily: serifFamily(weight), fontSize: size, color };
}
