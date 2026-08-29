/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Warm off-white rather than pure white — softer on a dark ground. */
    text: '#F3F8F9',
    /** Base colour, the gradient's darkest end, so nothing flashes bright. */
    background: '#0F2A3F',
    /**
     * Cards are light glass, not dark blocks. On a mid-tone background a
     * lighter surface reads as raised, where a darker one reads as a hole —
     * and letting the gradient through means cards higher up a screen pick up
     * more blue and lower ones more teal, so repeated cards vary on their own.
     */
    backgroundElement: 'rgba(255,255,255,0.09)',
    /** Selected and pressed: the same glass, lifted. */
    backgroundSelected: 'rgba(255,255,255,0.18)',
    /** Muted white rather than grey, which would go murky over the gradient. */
    textSecondary: 'rgba(243,248,249,0.68)',
    /** Accent for switches: the warmest thing in the palette. */
    primary: '#6EE7B7',
  },
} as const;

/**
 * Background gradient: deep sea blue easing into teal.
 *
 * Chosen for what the app is — someone telling their family about their day at
 * the end of it. Calm and evening-toned, and dark enough that white text sits
 * on it without glare, which the previous vivid purple couldn't manage.
 *
 * Kept here so every screen draws the same one; a gradient defined per screen
 * drifts and shows seams between tabs.
 */
export const BackgroundGradient = ['#0F2A3F', '#16536A', '#1B7E74'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Chosen to sit on the dark grey cards rather
 * than on the purple, which is where they all appear.
 */
export const Accents = {
  /** Warm on purpose: against a cool blue-teal ground, warm accents advance
   *  and cool ones disappear into the background. */
  amber: '#FFC15E',
  coral: '#FF8A7A',
  mint: '#6EE7B7',
  sky: '#7DD3FC',
  rose: '#F9A8D4',
} as const;

/**
 * Hairline edges and depth for cards. A translucent surface needs a defined
 * edge or it dissolves into the background; the light top border reads as the
 * card catching light, which is what stops a flat rectangle looking cut out.
 */
/** Destructive actions. Kept out of Accents, which are decorative. */
export const Danger = {
  fill: 'rgba(214,69,74,0.88)',
  border: 'rgba(255,138,122,0.55)',
} as const;

export const Surface = {
  border: 'rgba(255,255,255,0.16)',
  borderStrong: 'rgba(255,255,255,0.30)',
  shadow: 'rgba(6,20,30,0.45)',
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
const SURFACE_ALPHAS = [0.08, 0.11, 0.09, 0.13] as const;

export function surfaceFor(index: number): string {
  return `rgba(255,255,255,${SURFACE_ALPHAS[index % SURFACE_ALPHAS.length]})`;
}

export const AccentList = [
  Accents.amber,
  Accents.coral,
  Accents.mint,
  Accents.sky,
  Accents.rose,
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
