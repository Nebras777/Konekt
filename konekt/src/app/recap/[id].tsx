import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { PhotoGrid } from '@/components/PhotoGrid';
import RouteMap from '@/components/RouteMap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { DEMO_USERS, type DaySummary } from '@/constants/types';

const DUMMY_DAY_SUMMARY: DaySummary = {
  id: 'demo-day-1',
  userId: DEMO_USERS.sender,
  recipientId: DEMO_USERS.recipient,
  date: '2026-08-29',
  summaryText:
    'Sebti had a full day — started at the library, grabbed lunch with friends, hit the gym, and wound down with a walk in the park.',
  distanceKm: 6.4,
  createdAt: Date.now(),
  places: [
    {
      name: 'Home',
      type: 'home',
      lat: 40.7128,
      lng: -74.006,
      time: '8:10 AM',
      subtitle: 'Left for campus',
    },
    {
      name: 'Fischer Library',
      type: 'study',
      lat: 40.7295,
      lng: -73.9965,
      time: '9:00 AM',
      subtitle: 'Studied for 3 hours',
      photoUrl: 'https://picsum.photos/seed/library/400/400',
    },
    {
      name: 'Sunrise Diner',
      type: 'food',
      lat: 40.731,
      lng: -73.99,
      time: '12:30 PM',
      subtitle: 'Lunch with friends',
      photoUrl: 'https://picsum.photos/seed/diner/400/400',
    },
    {
      name: 'City Gym',
      type: 'gym',
      lat: 40.733,
      lng: -73.985,
      time: '4:15 PM',
      subtitle: 'Leg day',
    },
    {
      name: 'Riverside Park',
      type: 'outdoor',
      lat: 40.74,
      lng: -73.98,
      time: '6:45 PM',
      subtitle: 'Evening walk',
      photoUrl: 'https://picsum.photos/seed/park/400/400',
    },
  ],
};

export type RecapScreenContentProps = {
  daySummary: DaySummary;
  readOnly?: boolean;
};

export function RecapScreenContent({ daySummary, readOnly = false }: RecapScreenContentProps) {
  const router = useRouter();
  const [excludedStops, setExcludedStops] = useState<Set<number>>(new Set());

  // Excluded stops are dropped from the map too. A stop the sender has hidden from
  // the recap must not still be plotted for the recipient to see.
  const mappedPlaces = daySummary.places.filter((_, index) => !excludedStops.has(index));

  function toggleExcluded(index: number) {
    setExcludedStops((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Today&apos;s Recap</ThemedText>
          <ThemedText themeColor="textSecondary">{daySummary.summaryText}</ThemedText>

          <View style={styles.statsRow}>
            <Stat label="km" value={daySummary.distanceKm?.toFixed(1) ?? '—'} />
            <Stat label="stops" value={String(daySummary.places.length)} />
            <Stat
              label="photos"
              value={String(daySummary.places.filter((place) => place.photoUrl).length)}
            />
          </View>

          {mappedPlaces.length > 0 ? (
            <View style={styles.mapContainer}>
              <RouteMap places={mappedPlaces} interactive={false} />
            </View>
          ) : null}

          <View style={styles.stopsList}>
            {daySummary.places.map((place, index) => (
              <DayCard
                key={`${place.name}-${index}`}
                time={place.time}
                title={place.name}
                subtitle={place.subtitle}
                excluded={excludedStops.has(index)}
                onToggleExclude={readOnly ? undefined : () => toggleExcluded(index)}>
                {place.photoUrl ? <PhotoGrid photos={[place.photoUrl]} /> : null}
              </DayCard>
            ))}
          </View>

          {!readOnly ? (
            <View style={styles.actionsRow}>
              <Pressable onPress={() => router.back()} accessibilityRole="button">
                {({ pressed }) => (
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.secondaryButton, pressed && styles.pressed]}>
                    <ThemedText type="smallBold">Edit</ThemedText>
                  </ThemedView>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  // Wiring this up to the real send flow is a separate integration
                  // step once the backend track's send function is ready.
                }}
                accessibilityRole="button"
                style={styles.primaryButtonWrapper}>
                {({ pressed }) => (
                  <ThemedView
                    type="backgroundSelected"
                    style={[styles.primaryButton, pressed && styles.pressed]}>
                    <ThemedText type="smallBold">Send to {daySummary.recipientId}</ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.statTile}>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

export default function RecapRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const daySummary: DaySummary = { ...DUMMY_DAY_SUMMARY, id: id ?? DUMMY_DAY_SUMMARY.id };

  return <RecapScreenContent daySummary={daySummary} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
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
    height: 220,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  stopsList: {
    gap: Spacing.two,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  primaryButtonWrapper: {
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
