import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing, Surface, surfaceFor } from '@/constants/theme';
import type { Reaction } from '@/constants/types';
import { useAuth } from '@/hooks/use-auth';

import { getReactionsForOwner, markReactionsSeen } from '../../services/reactions';

/** Relative time, so a reaction reads as "2h ago" rather than a raw timestamp. */
function timeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function ActivityScreen() {
  const { profile } = useAuth();
  const [activity, setActivity] = useState<Reaction[] | null>(null);

  const load = useCallback(async () => {
    if (!profile) {
      setActivity([]);
      return;
    }
    try {
      setActivity(await getReactionsForOwner(profile.id));
    } catch {
      setActivity([]);
    }
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const unseen = (activity ?? []).filter((r) => !r.seen);

  async function markAllRead() {
    const ids = unseen.map((r) => r.id);
    setActivity((prev) => prev?.map((r) => ({ ...r, seen: true })) ?? prev);
    await markReactionsSeen(ids);
  }

  return (
    <ThemedView gradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {unseen.length > 0 ? (
          <Pressable onPress={markAllRead} accessibilityRole="button" style={styles.markAll}>
            {({ pressed }) => (
              <ThemedText
                type="smallBold"
                themeColor="textSecondary"
                style={pressed ? styles.pressed : undefined}>
                Mark all read
              </ThemedText>
            )}
          </Pressable>
        ) : null}

        {activity === null ? (
          <View style={styles.centre}>
            <ActivityIndicator />
          </View>
        ) : activity.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="default" themeColor="textSecondary">
              No activity yet. When someone reacts to a recap you sent, it shows up here.
            </ThemedText>
          </ThemedView>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {activity.map((item, index) => (
              <ThemedView
                key={item.id}
                type={item.seen ? 'backgroundElement' : 'backgroundSelected'}
                style={[
                  styles.row,
                  item.seen ? { backgroundColor: surfaceFor(index) } : null,
                ]}>
                <ThemedText type="small" style={styles.rowText}>
                  {item.seen ? '' : '• '}
                  <ThemedText type="smallBold">{item.reactorName}</ThemedText> reacted “
                  {item.label}” to your recap
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {timeAgo(item.createdAt)}
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  markAll: { alignSelf: 'flex-end' },
  card: { borderRadius: Spacing.four, padding: Spacing.four },
  list: { gap: Spacing.two, paddingBottom: Spacing.four },
  row: {
    flexDirection: 'row',
    borderWidth: Surface.borderWidth,
    borderColor: Surface.border,
    borderTopColor: Surface.borderStrong,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowText: { flexShrink: 1 },
  pressed: { opacity: 0.7 },
});
