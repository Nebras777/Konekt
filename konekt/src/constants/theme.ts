/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Deep ink with a violet cast — reads as warm next to the peach, where a
     *  neutral black would look sooty. */
    text: '#241F3D',
    /** Base colour, the gradient's first stop, so nothing flashes white. */
    background: '#FFE3D3',
    /**
     * Cards are white glass. On a light ground the gradient shows through just
     * enough that cards higher up a screen pick up peach and lower ones
     * periwinkle, so repeated cards vary without being given different colours.
     */
    backgroundElement: 'rgba(255,255,255,0.76)',
    /** Selected and pressed: the same glass, brought closer to solid. */
    backgroundSelected: 'rgba(255,255,255,0.96)',
    textSecondary: 'rgba(36,31,61,0.60)',
    /** Accent for switches. */
    primary: '#7C5CFF',
  },
} as const;

/** Solid surface for the tab bar. Native bars render alpha unreliably. */
export const TabBarSurface = '#FFFFFF';

/**
 * Background gradient: peach into pink into periwinkle.
 *
 * A sunset, which is when someone would actually sit down and send their day.
 * Light on purpose — the two dark schemes before this needed heavy cards to
 * stay legible, and heavy cards are what made the app feel blocky.
 */
export const BackgroundGradient = ['#FFE3D3', '#FFD6E7', '#E4E0FF'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Saturated on purpose: on a pale ground, pastel
 * accents disappear.
 */
export const Accents = {
  /** Saturated and candy-bright: on a pale ground, pastels would vanish. */
  tangerine: '#FF7A45',
  bubblegum: '#FF4D94',
  grape: '#7C5CFF',
  teal: '#00B8A9',
  sunshine: '#FFB020',
} as const;

/**
 * Hairline edges and depth for cards. A translucent surface needs a defined
 * edge or it dissolves into the background; the light top border reads as the
 * card catching light, which is what stops a flat rectangle looking cut out.
 */
/** Destructive actions. Kept out of Accents, which are decorative. */
export const Danger = {
  fill: '#E5484D',
  border: 'rgba(229,72,77,0.35)',
  /** Text on the red fill. The theme's ink is dark, which would be unreadable. */
  text: '#FFFFFF',
} as const;

export const Surface = {
  /** A soft ink edge: on a light ground a white border would be invisible. */
  border: 'rgba(36,31,61,0.10)',
  borderStrong: 'rgba(255,255,255,0.85)',
  /** Tinted rather than black, so shadows sit in the palette. */
  shadow: 'rgba(120,80,140,0.22)',
  /** Hairline. A pale ground wants thin edges — a heavy outline fights it. */
  borderWidth: 1,
} as const;

/** Corner radii, larger and softer than the old uniform 16. */
export const Radii = {
  sm: 10,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
} as const;

/**
 * Slight per-card variation in how much gradient shows through. Repeated cards
 * would otherwise all sit at the same opacity, which is the flatness this is
 * meant to avoid.
 */
const SURFACE_ALPHAS = [0.72, 0.82, 0.76, 0.88] as const;

export function surfaceFor(index: number): string {
  return `rgba(255,255,255,${SURFACE_ALPHAS[index % SURFACE_ALPHAS.length]})`;
}

export const AccentList = [
  Accents.tangerine,
  Accents.bubblegum,
  Accents.grape,
  Accents.teal,
  Accents.sunshine,
] as const;

/**
 * A stable accent for a given string, so the same person or stop keeps the same
 * colour between renders and between screens. Random would flicker on reload.
 */
export function accentFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return AccentList[hash % AccentList.length];
}

/**
 * Small alternating tilts. Applied to repeated cards so a list looks hand-placed
 * rather than machine-stacked. Kept under two degrees: past that, text starts to
 * look like a mistake rather than a choice.
 */
export const TILTS = ['-1.2deg', '0.9deg', '-0.6deg', '1.4deg'] as const;

export function tiltFor(index: number): string {
  return TILTS[index % TILTS.length];
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
