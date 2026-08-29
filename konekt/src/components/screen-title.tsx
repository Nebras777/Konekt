import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Radii, Spacing } from '@/constants/theme';

/**
 * A screen heading with a coloured bar beside it.
 *
 * The Today screen carries the logo plate; every other screen opened with a
 * plain white title and no colour above the fold. This gives each one an
 * identity of its own while keeping a single shape, so they read as the same
 * app rather than five unrelated pages.
 */
export function ScreenTitle({ children, accent }: { children: string; accent: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.bar, { backgroundColor: accent }]} />
      <ThemedText type="title">{children}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  bar: {
    width: 6,
    height: 30,
    borderRadius: Radii.pill,
  },
});
