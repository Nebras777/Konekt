/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Ink navy, not black — printed ink is never truly black. */
    text: '#1E2749',
    /** Base colour, the gradient's first stop, so nothing flashes white. */
    background: '#FFF3D6',
    /**
     * Cards are near-solid white with an ink outline, like stickers laid on
     * paper — not glass. Glass was right on a dark ground; on warm paper an
     * opaque card with a drawn edge is what reads as an object placed on top.
     */
    backgroundElement: '#FFFDF8',
    /** Selected and pressed: a wash of ink rather than more white. */
    backgroundSelected: '#E7EAFF',
    textSecondary: 'rgba(30,39,73,0.62)',
    /** Accent for switches. */
    primary: '#2D6BFF',
  },
} as const;

/** Solid surface for the tab bar. Native bars render alpha unreliably. */
export const TabBarSurface = '#FFFDF8';

/**
 * Background gradient: buttercream into apricot into soft rose.
 *
 * Warm paper rather than a colour wash — the palette's character comes from
 * the ink outlines and the print-bright accents sitting on it, not from the
 * background shouting.
 */
export const BackgroundGradient = ['#FFF3D6', '#FFE3C4', '#FFD6DC'] as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Playful accents, used to give repeated elements their own identity — stat
 * tiles, avatars, stop markers. Chosen to sit on the dark grey cards rather
 * than on the purple, which is where they all appear.
 */
export const Accents = {
  /** Risograph inks: few colours, each fully saturated, none muddy. */
  vermilion: '#FF5C39',
  blue: '#2D6BFF',
  green: '#00A86B',
  magenta: '#FF3D9A',
  yellow: '#FFB800',
} as const;

/**
 * Hairline edges and depth for cards. A translucent surface needs a defined
 * edge or it dissolves into the background; the light top border reads as the
 * card catching light, which is what stops a flat rectangle looking cut out.
 */
/** Destructive actions. Kept out of Accents, which are decorative. */
export const Danger = {
  fill: '#FF3B30',
  border: 'rgba(30,39,73,0.85)',
  /** Text on the red fill. The theme's ink is dark and unreadable on it. */
  text: '#FFFFFF',
} as const;

export const Surface = {
  /** A drawn ink edge, not a hairline. This is what makes a card an object. */
  border: 'rgba(30,39,73,0.85)',
  borderStrong: 'rgba(30,39,73,0.95)',
  /** Ink-tinted, so shadows warm the paper rather than greying it. */
  shadow: 'rgba(30,39,73,0.30)',
  /** Outlines are drawn, so they need weight. */
  borderWidth: 2,
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
const CARD_TINTS = ['#FFFDF8', '#FFFAF0', '#FDFBFF', '#FFF9F4'] as const;

export function surfaceFor(index: number): string {
  return CARD_TINTS[index % CARD_TINTS.length];
}

export const AccentList = [
  Accents.vermilion,
  Accents.blue,
  Accents.green,
  Accents.magenta,
  Accents.yellow,
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
