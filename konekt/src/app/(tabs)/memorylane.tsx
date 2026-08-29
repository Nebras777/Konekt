import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { PhotoGrid } from '@/components/PhotoGrid';
import RouteMap, { hasPosition } from '@/components/RouteMap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { accentFor, BottomTabInset, Spacing } from '@/constants/theme';
import type { DaySummary } from '@/constants/types';
import { useAuth } from '@/hooks/use-auth';
import { mediaForPlace } from '@/utils/placeMedia';

import { getMyDays } from '../../../services/firestore';

type DayGroup = {
  date: string;
  summaries: DaySummary[];
};

// A user may send more than one recap on the same calendar date — group them
// so Memory Lane shows exactly one button per date, not one per recap.
function groupByDate(days: DaySummary[]): DayGroup[] {
  const groups = new Map<string, DaySummary[]>();
  for (const day of days) {
    const existing = groups.get(day.date);
    if (existing) {
      existing.push(day);
    } else {
      groups.set(day.date, [day]);
    }
  }
  return Array.from(groups, ([date, summaries]) => ({ date, summaries }));
}

function formatDate(date: string): string {
  // new Date('2026-08-30') parses as UTC midnight, which then renders as the
  // previous day anywhere west of Greenwich. Build it from the parts so the
  // date shown is the date stored.
  const [year, month, day] = date.split('-').map(Number);
  const parsed =
    year && month && day ? new Date(year, month - 1, day) : new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default function MemoryLaneScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  // null = still loading, [] = loaded but empty
  const [days, setDays] = useState<DaySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setError(null);
    try {
      if (!profile) {
        setDays([]);
        return;
      }
      const myDays = await getMyDays(profile.id);
      setDays(myDays);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your memories');
      setDays([]);
    }
    // profile arrives asynchronously from storage, so this must re-run when it
    // does — otherwise the list stays empty from the null first render.
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <ThemedView gradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Memory Lane</ThemedText>

        {days === null ? (
          <View style={styles.centre}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <Message text={error} />
        ) : days.length === 0 ? (
          <Message text="Your memories will show up here once you've sent your first recap." />
        ) : (
          <FlatList
            data={groupByDate(days)}
            keyExtractor={(group) => group.date}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <DayAccordion
                group={item}
                expanded={expanded.has(item.date)}
                onToggle={() => toggleExpanded(item.date)}
                onViewFull={(id) => router.push(`/recap/${id}`)}
              />
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function DayAccordion({
  group,
  expanded,
  onToggle,
  onViewFull,
}: {
  group: DayGroup;
  expanded: boolean;
  onToggle: () => void;
  onViewFull: (id: string) => void;
}) {
  return (
    <View style={styles.accordion}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded }}>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.dayButton, pressed && styles.pressed]}>
            <View style={styles.dateLabel}>
              <View style={[styles.dateDot, { backgroundColor: accentFor(group.date) }]} />
              <ThemedText type="smallBold" style={{ color: accentFor(group.date) }}>
                {formatDate(group.date)}
              </ThemedText>
            </View>
            <ThemedText themeColor="textSecondary">{expanded ? '▾' : '▸'}</ThemedText>
          </ThemedView>
        )}
      </Pressable>

      {expanded ? (
        <View style={styles.dayContentWrapper}>
          {group.summaries.map((day) => (
            <MemoryRecapCard key={day.id} day={day} onViewFull={() => onViewFull(day.id)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** One past day, rendered in the same rich format used for received recaps. */
function MemoryRecapCard({ day, onViewFull }: { day: DaySummary; onViewFull: () => void }) {
  const photoCount = day.places.filter((place) => place.photoUrl || place.mediaUri).length;

  return (
    <ThemedView type="backgroundElement" style={styles.recapCard}>
      <ThemedText themeColor="textSecondary">{day.summaryText}</ThemedText>

      <View style={styles.statsRow}>
        <Stat label="km" value={day.distanceKm?.toFixed(1) ?? '—'} />
        <Stat label="stops" value={String(day.places.length)} />
        <Stat label="photos" value={String(photoCount)} />
      </View>

      {day.places.some(hasPosition) ? (
        <View style={styles.mapContainer}>
          <RouteMap places={day.places} interactive={false} />
        </View>
      ) : null}

      <View style={styles.stopsList}>
        {day.places.map((place, index) => (
          <DayCard
            key={`${place.name}-${index}`}
            index={index}
            placeType={place.type}
            time={place.time}
            title={place.name}
            subtitle={place.subtitle}>
            <PhotoGrid photos={mediaForPlace(place)} />
          </DayCard>
        ))}
      </View>

      <Pressable onPress={onViewFull} accessibilityRole="button">
        {({ pressed }) => (
          <ThemedText type="link" style={pressed ? styles.pressed : undefined}>
            View full recap
          </ThemedText>
        )}
      </Pressable>
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
  dateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
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
  messageCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  accordion: {
    gap: Spacing.two,
  },
  dayButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  dayContentWrapper: {
    gap: Spacing.three,
  },
  recapCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
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
