/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Cool white with a blue cast, so it belongs to the indigo rather than
     *  sitting on it as a neutral. */
    text: '#EEF1FF',
    /** Deepest indigo. Cards sit above this, never below it. */
    background: '#12142A',
    /** A white film over the indigo, which picks up the hue beneath. */
    backgroundElement: 'rgba(255,255,255,0.08)',
    /** Selected and pressed lift toward the brand periwinkle. */
    backgroundSelected: 'rgba(141,162,255,0.26)',
    textSecondary: 'rgba(238,241,255,0.60)',
    /**
     * Amber, and deliberately the only warm thing in the palette. A cool ground
     * with a single warm accent is what makes the accent read as important —
     * five competing brights read as decoration.
     */
    primary: '#FFB25C',
  },
} as const;

/** Text on a filled primary button. Amber is light, so dark text sits on it. */
export const PrimaryText = '#181B33';
export const PrimaryDark = '#E09A45';

export const TabBarSurface = '#191D3A';

/**
 * Background gradient: indigo night, lighter at the top.
 *
 * Indigo rather than violet because the logo runs periwinkle to navy — a violet
 * ground put the wordmark in a neighbouring hue that never quite agreed with
 * it. Light above dark reads as depth rather than as a colour wash.
 */
export const BackgroundGradient = ['#252C5C', '#1A1F40', '#12142A'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Saturated on purpose: on a pale ground, pastel
 * accents disappear.
 */
export const Accents = {
  /** One warm hero, then jewel tones that all sit at a similar lightness — a
   *  set, rather than five colours borrowed from three different palettes. */
  amber: '#FFB25C',
  periwinkle: '#8DA2FF',
  mint: '#5FD9B4',
  rose: '#FF8FB1',
  lilac: '#B79CFF',
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
  fill: '#FF7A8A',
  border: 'rgba(224,82,96,0.35)',
  /** Text on the red fill. The theme's text colour is dark and unreadable on it. */
  text: '#FFFFFF',
} as const;

export const Surface = {
  border: 'rgba(255,255,255,0.10)',
  /** Brighter on top: a lit upper edge is what makes a flat panel look raised. */
  borderStrong: 'rgba(255,255,255,0.22)',
  shadow: 'rgba(0,0,0,0.5)',
  /** An amber cast under the primary button, so it appears to glow. */
  glow: 'rgba(255,178,92,0.45)',
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
const CARD_TINTS = ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.095)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.11)'] as const;

export function surfaceFor(index: number): string {
  return CARD_TINTS[index % CARD_TINTS.length];
}

export const AccentList = [
  Accents.amber,
  Accents.periwinkle,
  Accents.mint,
  Accents.rose,
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
