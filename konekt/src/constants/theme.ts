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
    text: '#F2F6FF',
    /** The gradient's darkest stop. Cards sit above this, never below it. */
    background: '#08091A',
    /** A white film over the indigo, which picks up the hue beneath. */
    backgroundElement: 'rgba(255,255,255,0.11)',
    /** Selected and pressed lift toward the brand periwinkle. */
    backgroundSelected: 'rgba(0,229,255,0.28)',
    textSecondary: 'rgba(242,246,255,0.76)',
    /**
     * Amber, and deliberately the only warm thing in the palette. A cool ground
     * with a single warm accent is what makes the accent read as important —
     * five competing brights read as decoration.
     */
    primary: '#00E5FF',
  },
} as const;

/** Text on a filled primary button. Amber is light, so dark text sits on it. */
export const PrimaryText = '#04060F';
export const PrimaryDark = '#00B8CC';

export const TabBarSurface = '#181B40';

/**
 * Background gradient: indigo night, lighter at the top.
 *
 * Indigo rather than violet because the logo runs periwinkle to navy — a violet
 * ground put the wordmark in a neighbouring hue that never quite agreed with
 * it. Light above dark reads as depth rather than as a colour wash.
 *
 * Lifted well off black: the darker version was heavy, and a mid indigo still
 * carries white text comfortably while letting the accents sing on top of it.
 */
export const BackgroundGradient = ['#1B1D45', '#101230', '#08091A'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Saturated on purpose: on a pale ground, pastel
 * accents disappear.
 */
export const Accents = {
  /**
   * Neon: high saturation and high lightness both, which is what separates a
   * neon from a merely bright colour. They only work over a near-black ground —
   * the same values on the previous mid indigo would have looked garish rather
   * than lit.
   */
  cyan: '#00E5FF',
  magenta: '#FF2E97',
  lime: '#3DFF9A',
  yellow: '#FFE83D',
  violet: '#A855FF',
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
  fill: '#FF4D6D',
  border: 'rgba(224,82,96,0.35)',
  /** Text on the red fill. The theme's text colour is dark and unreadable on it. */
  text: '#FFFFFF',
} as const;

export const Surface = {
  border: 'rgba(255,255,255,0.16)',
  /** Brighter on top: a lit upper edge is what makes a flat panel look raised.
   *  Stronger here than on a lighter ground — a faint edge disappears entirely
   *  against near-black. */
  borderStrong: 'rgba(255,255,255,0.40)',
  shadow: 'rgba(0,0,0,0.5)',
  /** An amber cast under the primary button, so it appears to glow. */
  glow: 'rgba(0,229,255,0.55)',
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
const CARD_TINTS = ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.135)', 'rgba(255,255,255,0.115)', 'rgba(255,255,255,0.155)'] as const;

export function surfaceFor(index: number): string {
  return CARD_TINTS[index % CARD_TINTS.length];
}

export const AccentList = [
  Accents.cyan,
  Accents.magenta,
  Accents.lime,
  Accents.yellow,
  Accents.violet,
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
