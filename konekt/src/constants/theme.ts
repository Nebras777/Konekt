/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Deep sea navy. Reads as the dark end of the same blue rather than as
     *  an unrelated black dropped on top. */
    text: '#0E3556',
    /** Base colour, the gradient's first stop, so nothing flashes white. */
    background: '#8FE1FF',
    /**
     * Cards are white, slightly translucent, so the sky shows faintly through.
     * Cards high on a screen pick up cyan and lower ones periwinkle, which
     * varies a list without giving cards different colours.
     */
    backgroundElement: 'rgba(255,255,255,0.86)',
    /** Selected and pressed: solid white, the brightest thing available. */
    backgroundSelected: '#FFFFFF',
    textSecondary: 'rgba(14,53,86,0.60)',
    /** Accent for switches: coral, the complement of sky blue. */
    primary: '#FF7A59',
  },
} as const;

/** Solid surface for the tab bar. Native bars render alpha unreliably. */
export const TabBarSurface = '#FFFFFF';

/**
 * Background gradient: cyan into sky into periwinkle.
 *
 * Light and airy — the palette's warmth comes from the accents sitting on it,
 * not from the background. Pale enough that dark text needs no help, which is
 * what lets the cards stay light instead of heavy.
 */
export const BackgroundGradient = ['#8FE1FF', '#7FC8FB', '#79ADF2'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Chosen to sit on the dark grey cards rather
 * than on the purple, which is where they all appear.
 */
export const Accents = {
  /** Warm, to complement a cool ground — on sky blue these advance where
   *  another blue would disappear. */
  coral: '#FF7A59',
  sunshine: '#FFC24D',
  mint: '#2ED3A7',
  violet: '#7C6BFF',
  pink: '#FF6FA5',
} as const;

/**
 * Hairline edges and depth for cards. A translucent surface needs a defined
 * edge or it dissolves into the background; the light top border reads as the
 * card catching light, which is what stops a flat rectangle looking cut out.
 */
/** Destructive actions. Kept out of Accents, which are decorative. */
export const Danger = {
  fill: '#FF4D4D',
  border: 'rgba(255,77,77,0.45)',
  /** Text on the red fill. The theme's ink is dark and unreadable on it. */
  text: '#FFFFFF',
} as const;

export const Surface = {
  /** A soft navy hairline. The heavy ink outline of the previous scheme fought
   *  the softness of this one — airy backgrounds want thin edges. */
  border: 'rgba(14,53,86,0.10)',
  /** A white top edge, so a card looks lit from above rather than cut out. */
  borderStrong: 'rgba(255,255,255,0.95)',
  /** Blue-tinted, so shadows sit in the sky rather than greying it. */
  shadow: 'rgba(20,70,120,0.20)',
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
const SURFACE_ALPHAS = [0.82, 0.90, 0.86, 0.94] as const;

export function surfaceFor(index: number): string {
  return `rgba(255,255,255,${SURFACE_ALPHAS[index % SURFACE_ALPHAS.length]})`;
}

export const AccentList = [
  Accents.coral,
  Accents.sunshine,
  Accents.mint,
  Accents.violet,
  Accents.pink,
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
