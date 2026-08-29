import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Ping, Reaction } from '@/constants/types';
import { useAuth } from '@/hooks/use-auth';

import { getPingsFor, markPingsSeen } from '../../services/pings';
import { getReactionsForOwner, markReactionsSeen } from '../../services/reactions';

/** One row in the feed, from either source. */
type Item = {
  id: string;
  createdAt: number;
  seen: boolean;
  text: string;
  source: 'reaction' | 'ping';
};

function toItems(reactions: Reaction[], pings: Ping[]): Item[] {
  return [
    ...reactions.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      seen: r.seen,
      text: `${r.reactorName} reacted “${r.label}” to your recap`,
      source: 'reaction' as const,
    })),
    ...pings.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      seen: p.seen,
      text:
        p.kind === 'checkin'
          ? `${p.fromName} is thinking of you — share when you can`
          : `${p.fromName} let you know they're okay`,
      source: 'ping' as const,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);
}

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
  const [activity, setActivity] = useState<Item[] | null>(null);

  const load = useCallback(async () => {
    if (!profile) {
      setActivity([]);
      return;
    }
    try {
      const [reactions, pings] = await Promise.all([
        getReactionsForOwner(profile.id),
        getPingsFor(profile.id),
      ]);
      setActivity(toItems(reactions, pings));
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
    const reactionIds = unseen.filter((i) => i.source === 'reaction').map((i) => i.id);
    const pingIds = unseen.filter((i) => i.source === 'ping').map((i) => i.id);
    setActivity((prev) => prev?.map((i) => ({ ...i, seen: true })) ?? prev);
    await Promise.all([markReactionsSeen(reactionIds), markPingsSeen(pingIds)]);
  }

  return (
    <ThemedView style={styles.container}>
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
              Nothing yet. Reactions to your recaps, and check-ins from your people, show up here.
            </ThemedText>
          </ThemedView>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {activity.map((item) => (
              <ThemedView
                key={item.id}
                type={item.seen ? 'backgroundElement' : 'backgroundSelected'}
                style={styles.row}>
                <ThemedText type="small" style={styles.rowText}>
                  {item.seen ? '' : '• '}
                  {item.text}
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
