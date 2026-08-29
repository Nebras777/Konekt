import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { PhotoGrid } from '@/components/PhotoGrid';
import RouteMap from '@/components/RouteMap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { DEMO_USERS, type DaySummary } from '@/constants/types';

import { getInbox } from '../../../services/firestore';

const REACTIONS = ['Love it', 'Proud', 'Call me'] as const;

export default function RecapsScreen() {
  // null = still loading, [] = loaded but empty
  const [summaries, setSummaries] = useState<DaySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const inbox = await getInbox(DEMO_USERS.recipient);
      setSummaries(inbox);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load recaps');
      setSummaries([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Recaps</ThemedText>

        {summaries === null ? (
          <View style={styles.centre}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <Message text={error} />
        ) : summaries.length === 0 ? (
          <Message text="No recaps yet. When someone sends you their day, it shows up here." />
        ) : (
          <FlatList
            data={summaries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <InboxRecap summary={item} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

/** One received recap, rendered read-only, with a reaction row on top. */
function InboxRecap({ summary }: { summary: DaySummary }) {
  const photoCount = summary.places.filter((place) => place.photoUrl).length;

  return (
    <ThemedView type="backgroundElement" style={styles.recapCard}>
      <View style={styles.reactionRow}>
        {REACTIONS.map((label) => (
          <Pressable key={label} accessibilityRole="button" style={styles.reactionWrapper}>
            {({ pressed }) => (
              <ThemedView
                type="backgroundSelected"
                style={[styles.reactionChip, pressed && styles.pressed]}>
                <ThemedText type="smallBold">{label}</ThemedText>
              </ThemedView>
            )}
          </Pressable>
        ))}
      </View>

      <ThemedText type="subtitle">{summary.userId}&apos;s day</ThemedText>
      <ThemedText themeColor="textSecondary">{summary.summaryText}</ThemedText>

      <View style={styles.statsRow}>
        <Stat label="km" value={summary.distanceKm?.toFixed(1) ?? '—'} />
        <Stat label="stops" value={String(summary.places.length)} />
        <Stat label="photos" value={String(photoCount)} />
      </View>

      {summary.places.length > 0 ? (
        <View style={styles.mapContainer}>
          <RouteMap places={summary.places} interactive={false} />
        </View>
      ) : null}

      <View style={styles.stopsList}>
        {summary.places.map((place, index) => (
          <DayCard
            key={`${place.name}-${index}`}
            time={place.time}
            title={place.name}
            subtitle={place.subtitle}>
            {place.photoUrl ? <PhotoGrid photos={[place.photoUrl]} /> : null}
          </DayCard>
        ))}
      </View>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundSelected" style={styles.statTile}>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function Message({ text }: { text: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.messageCard}>
      <ThemedText type="default" themeColor="textSecondary">
        {text}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  messageCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  recapCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  reactionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  reactionWrapper: {
    flex: 1,
  },
  reactionChip: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  mapContainer: {
    height: 200,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  stopsList: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
