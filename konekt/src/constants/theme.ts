/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** White on the purple gradient and on the dark cards alike. */
    text: '#FFFFFF',
    /**
     * The gradient's starting colour, used as the base everywhere. Screens opt
     * into the gradient itself with <ThemedView gradient>; this is what shows
     * if the gradient can't draw, so it is never grey.
     */
    background: '#900CFF',
    /**
     * Cards are translucent dark rather than solid grey. Because the gradient
     * shows through, a card near the top of a screen picks up more purple and
     * one further down more magenta — so repeated cards vary on their own
     * instead of tiling the same flat block forty times.
     */
    backgroundElement: 'rgba(26,26,34,0.66)',
    /** Selected chips and pressed states: same surface, lifted. */
    backgroundSelected: 'rgba(72,66,92,0.78)',
    /** Muted white. Grey secondary text would disappear on both surfaces. */
    textSecondary: '#B9BAC4',
    /** Accent for switches, picked from the gradient's bright end. */
    primary: '#CC1BFF',
  },
} as const;

/**
 * Background gradient, vivid purple into magenta.
 *
 * Kept here so every screen draws the same one — a gradient defined per screen
 * drifts, and the seams show when you move between tabs.
 */
export const BackgroundGradient = ['#900CFF', '#CC1BFF'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Chosen to sit on the dark grey cards rather
 * than on the purple, which is where they all appear.
 */
export const Accents = {
  mint: '#3DDC97',
  sun: '#FFD166',
  coral: '#FF6B6B',
  sky: '#4CC9F0',
  lilac: '#C77DFF',
} as const;

/**
 * Hairline edges and depth for cards. A translucent surface needs a defined
 * edge or it dissolves into the background; the light top border reads as the
 * card catching light, which is what stops a flat rectangle looking cut out.
 */
export const Surface = {
  border: 'rgba(255,255,255,0.14)',
  borderStrong: 'rgba(255,255,255,0.22)',
  shadow: 'rgba(0,0,0,0.35)',
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
const SURFACE_ALPHAS = [0.6, 0.68, 0.63, 0.72] as const;

export function surfaceFor(index: number): string {
  return `rgba(26,26,34,${SURFACE_ALPHAS[index % SURFACE_ALPHAS.length]})`;
}

export const AccentList = [
  Accents.mint,
  Accents.sun,
  Accents.coral,
  Accents.sky,
  Accents.lilac,
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
