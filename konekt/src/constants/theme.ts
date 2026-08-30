/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Near-black, warmed very slightly so it doesn't look like pure #000. */
    text: '#111318',
    /** The pale periwinkle page the cards sit on. */
    background: '#E9EDFB',
    /** Cards are plain white. On a pale ground that is all the separation they
     *  need — no film, no tint. */
    backgroundElement: '#FFFFFF',
    /** Unselected chips and pressed states: a light grey, not a colour. */
    backgroundSelected: '#EFF1F7',
    textSecondary: '#6B7280',
    /** Near-black. Primary actions and switches are ink, not an accent. */
    primary: '#151823',
  },
} as const;

/** Text on a filled primary button. */
export const PrimaryText = '#FFFFFF';
export const PrimaryDark = '#000000';

export const TabBarSurface = '#FFFFFF';

/**
 * Background gradient: a shallow periwinkle wash, lighter at the top.
 *
 * Deliberately narrow. In this scheme the colour lives in the page and
 * everything on it is white, black or grey — a wide gradient would pull
 * attention away from content that has almost none of its own.
 */
export const BackgroundGradient = ['#EDF1FD', '#E5EAFA', '#DCE2F8'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Saturated on purpose: on a pale ground, pastel
 * accents disappear.
 */
export const Accents = {
  /**
   * Muted, and used sparingly. This scheme is near-monochrome: colour appears
   * on status dots and avatars, not on numbers or card edges. Saturated
   * accents would fight a palette whose whole point is restraint.
   */
  green: '#22A366',
  indigo: '#4F5BD5',
  amber: '#C98A16',
  rose: '#D2517A',
  slate: '#5B6478',
} as const;

/**
 * Hairline edges and depth for cards. A translucent surface needs a defined
 * edge or it dissolves into the background; the light top border reads as the
 * card catching light, which is what stops a flat rectangle looking cut out.
 */
/** Destructive actions. Kept out of Accents, which are decorative. */
export const Danger = {
  fill: '#D92D3A',
  border: 'rgba(217,45,58,0.35)',
  text: '#FFFFFF',
} as const;

export const Surface = {
  /** A faint ink hairline. White cards on a pale ground barely need one. */
  border: 'rgba(17,19,24,0.08)',
  borderStrong: 'rgba(17,19,24,0.12)',
  /** Soft and blue-grey, so shadows sit in the page rather than greying it. */
  shadow: 'rgba(40,50,90,0.10)',
  glow: 'rgba(21,24,35,0.18)',
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
const CARD_TINTS = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'] as const;

export function surfaceFor(index: number): string {
  return CARD_TINTS[index % CARD_TINTS.length];
}

export const AccentList = [
  Accents.indigo,
  Accents.green,
  Accents.amber,
  Accents.rose,
  Accents.slate,
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
export const TILTS = ['0deg'] as const;

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
