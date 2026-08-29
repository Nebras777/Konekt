import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { accentFor, Spacing, tiltFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DayCardProps = {
  time: string;
  title: string;
  subtitle?: string;
  excluded?: boolean;
  onToggleExclude?: () => void;
  children?: ReactNode;
  /** Position in a list, used to vary the tilt so stacked cards don't align. */
  index?: number;
};

export function DayCard({
  time,
  title,
  subtitle,
  excluded = false,
  onToggleExclude,
  children,
  index = 0,
}: DayCardProps) {
  const theme = useTheme();
  const included = !excluded;

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        {
          transform: [{ rotate: tiltFor(index) }],
          borderLeftColor: accentFor(title),
        },
        excluded && styles.cardExcluded,
      ]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {time}
          </ThemedText>
          <ThemedText type="default">{title}</ThemedText>
          {subtitle ? (
            <ThemedText type="small" themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          ) : null}
        </View>

        {onToggleExclude ? (
          <Pressable
            onPress={onToggleExclude}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: included }}
            accessibilityLabel={included ? `Exclude ${title}` : `Include ${title}`}
            style={[
              styles.checkbox,
              { borderColor: theme.textSecondary },
              included && { backgroundColor: theme.backgroundSelected, borderColor: theme.text },
            ]}>
            {included ? <ThemedText type="smallBold">{'✓'}</ThemedText> : null}
          </Pressable>
        ) : null}
      </View>

      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    // The accent lives on an edge rather than the fill, so the card stays
    // readable while still being identifiably "this stop".
    borderLeftWidth: 4,
    // Tilted cards would otherwise clip their neighbours' corners.
    marginHorizontal: Spacing.one,
  },
  cardExcluded: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Spacing.one,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
