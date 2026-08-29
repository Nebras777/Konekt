/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** The navy the wordmark ends on. Text and logo are then the same colour,
     *  rather than the logo sitting on a palette it has nothing to do with. */
    text: '#1B2447',
    /** Base colour, the gradient's first stop, so nothing flashes white. */
    background: '#F0F4FE',
    /**
     * Cards are white and slightly translucent, so the wash shows faintly
     * through — cards high on a screen pick up less tint and lower ones more,
     * varying a list without giving cards different colours.
     */
    backgroundElement: 'rgba(255,255,255,0.90)',
    /** Selected and pressed: solid white. */
    backgroundSelected: '#FFFFFF',
    textSecondary: 'rgba(27,36,71,0.60)',
    /** The mid-blue from the middle of the wordmark. */
    primary: '#4A5FA8',
  },
} as const;

/** Solid surface for the tab bar. Native bars render alpha unreliably. */
export const TabBarSurface = '#FFFFFF';

/**
 * Background gradient: pale tints of the logo's own periwinkle.
 *
 * The logo runs light periwinkle to deep navy. Using that gradient directly
 * would mean a dark ground and white text; using tints of its light end keeps
 * the brand's colour while leaving the navy free for text — so the wordmark
 * reads as part of the app rather than pasted onto it.
 */
export const BackgroundGradient = ['#F0F4FE', '#DEE7FB', '#C6D4F4'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Saturated on purpose: on a pale ground, pastel
 * accents disappear.
 */
export const Accents = {
  /** Two taken straight from the logo's gradient... */
  periwinkle: '#7C9BE8',
  indigo: '#4A5FA8',
  /** ...and three warm ones, because five shades of the same blue would make
   *  stat tiles and avatars indistinguishable, and warm colours advance
   *  against a cool ground where another blue would sink into it. */
  coral: '#FF8A6B',
  gold: '#FFC24D',
  teal: '#2FBFAE',
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
  /** A hairline in the brand navy rather than a neutral grey. */
  border: 'rgba(27,36,71,0.10)',
  borderStrong: 'rgba(255,255,255,0.95)',
  /** Blue-tinted, so shadows sit in the palette rather than greying it. */
  shadow: 'rgba(40,60,120,0.16)',
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
const SURFACE_ALPHAS = [0.86, 0.94, 0.90, 0.98] as const;

export function surfaceFor(index: number): string {
  return `rgba(255,255,255,${SURFACE_ALPHAS[index % SURFACE_ALPHAS.length]})`;
}

export const AccentList = [
  Accents.periwinkle,
  Accents.coral,
  Accents.gold,
  Accents.teal,
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
