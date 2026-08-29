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
     * Solid fallback for the gradient, set to its starting colour so nothing
     * flashes a different shade before the gradient paints.
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
