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
    /** Cards: dark grey, so they read as raised against the vivid purple. */
    backgroundElement: '#26262E',
    /** Selected chips and pressed states — a lift from the card, not a new colour. */
    backgroundSelected: '#3A3A45',
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
