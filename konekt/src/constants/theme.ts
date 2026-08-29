/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#25232B',
    background: '#F8F7FC',
    /** Surface: cards are solid white against the near-white ground. */
    backgroundElement: '#FFFFFF',
    /** Lavender, for selected chips and pressed states. */
    backgroundSelected: '#E9E6FF',
    textSecondary: '#777380',
    primary: '#7C6EE6',
  },
} as const;

/** The darker primary, for pressed states and emphasis. */
export const PrimaryDark = '#5B4BC4';

/** Solid surface for the tab bar. Native bars render alpha unreliably. */
export const TabBarSurface = '#FFFFFF';

/**
 * Background gradient: the background colour easing into lavender.
 *
 * Kept very shallow. With a near-white ground and white cards, a strong
 * gradient would swamp the small amount of contrast holding the two apart —
 * this reads as a tint rather than a wash. Set all three stops to the
 * background colour for a flat background instead.
 */
export const BackgroundGradient = ['#F8F7FC', '#F1EEFB', '#E9E6FF'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Saturated on purpose: on a pale ground, pastel
 * accents disappear.
 */
export const Accents = {
  violet: '#7C6EE6',
  green: '#69B58A',
  amber: '#E8A84C',
  pink: '#D875A5',
  indigo: '#5B4BC4',
} as const;

/**
 * Hairline edges and depth for cards. A translucent surface needs a defined
 * edge or it dissolves into the background; the light top border reads as the
 * card catching light, which is what stops a flat rectangle looking cut out.
 */
/** Destructive actions. Kept out of Accents, which are decorative. */
export const Danger = {
  /** No red was specified in the palette, so this is chosen to sit beside the
   *  violet rather than clash with it — slightly rose, not fire-engine. */
  fill: '#E05260',
  border: 'rgba(224,82,96,0.35)',
  /** Text on the red fill. The theme's text colour is dark and unreadable on it. */
  text: '#FFFFFF',
} as const;

export const Surface = {
  /**
   * White cards on a near-white ground have almost no contrast of their own,
   * so the edge is what separates them. Tinted with the text colour rather
   * than pure grey.
   */
  border: 'rgba(37,35,43,0.09)',
  borderStrong: 'rgba(37,35,43,0.14)',
  /** Violet-tinted, so shadows sit in the palette rather than greying it. */
  shadow: 'rgba(91,75,196,0.16)',
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
const CARD_TINTS = ['#FFFFFF', '#FDFCFF', '#FBFAFF', '#FEFDFF'] as const;

export function surfaceFor(index: number): string {
  return CARD_TINTS[index % CARD_TINTS.length];
}

export const AccentList = [
  Accents.violet,
  Accents.green,
  Accents.amber,
  Accents.pink,
  Accents.indigo,
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
