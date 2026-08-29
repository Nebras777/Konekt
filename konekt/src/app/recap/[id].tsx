import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { PhotoGrid } from '@/components/PhotoGrid';
import RouteMap from '@/components/RouteMap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { DEMO_USERS, type DaySummary } from '@/constants/types';

import { clearDraftRecap, getDraftRecap } from '../../../services/draftRecap';
import { getDaySummaryById, saveDaySummary } from '../../../services/firestore';
import { totalDistanceKm } from '../../../services/sendRecap';

export type RecapScreenContentProps = {
  daySummary: DaySummary;
  /** True once this recap is already saved (e.g. viewed from someone's inbox) — hides editing/send. */
  readOnly?: boolean;
};

export function RecapScreenContent({ daySummary, readOnly = false }: RecapScreenContentProps) {
  const router = useRouter();
  const [excludedStops, setExcludedStops] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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

  // Excluded stops are dropped from stats, the map, and what actually gets sent —
  // a stop the sender has hidden must not still show up for the recipient.
  const visiblePlaces = daySummary.places.filter((_, index) => !excludedStops.has(index));
  const distanceKm = readOnly ? daySummary.distanceKm : totalDistanceKm(visiblePlaces);
  const photoCount = visiblePlaces.filter((place) => place.photoUrl).length;

  function handleCancel() {
    clearDraftRecap(daySummary.id);
    router.back();
  }

  async function handleSend() {
    setSending(true);
    setSendError(null);
    try {
      await saveDaySummary({
        ...daySummary,
        places: visiblePlaces,
        distanceKm: totalDistanceKm(visiblePlaces),
      });
      clearDraftRecap(daySummary.id);
      router.replace('/');
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Could not send this recap');
      setSending(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Today&apos;s Recap</ThemedText>
          <ThemedText themeColor="textSecondary">{daySummary.summaryText}</ThemedText>

          <View style={styles.statsRow}>
            <Stat label="km" value={distanceKm?.toFixed(1) ?? '—'} />
            <Stat label="stops" value={String(visiblePlaces.length)} />
            <Stat label="photos" value={String(photoCount)} />
          </View>

          {visiblePlaces.length > 0 ? (
            <View style={styles.mapContainer}>
              <RouteMap places={visiblePlaces} interactive={false} />
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
            <View style={styles.actionsSection}>
              {sendError ? (
                <ThemedText themeColor="textSecondary">{sendError}</ThemedText>
              ) : null}
              <View style={styles.actionsRow}>
                <Pressable onPress={handleCancel} accessibilityRole="button" disabled={sending}>
                  {({ pressed }) => (
                    <ThemedView
                      type="backgroundElement"
                      style={[styles.secondaryButton, pressed && styles.pressed]}>
                      <ThemedText type="smallBold">Discard</ThemedText>
                    </ThemedView>
                  )}
                </Pressable>
                <Pressable
                  onPress={handleSend}
                  accessibilityRole="button"
                  disabled={sending}
                  style={styles.primaryButtonWrapper}>
                  {({ pressed }) => (
                    <ThemedView
                      type="backgroundSelected"
                      style={[styles.primaryButton, pressed && styles.pressed]}>
                      <ThemedText type="smallBold">
                        {sending ? 'Sending…' : `Send to ${daySummary.recipientId}`}
                      </ThemedText>
                    </ThemedView>
                  )}
                </Pressable>
              </View>
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

type RouteStatus = 'loading' | 'error' | 'draft' | 'sent';

export default function RecapRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [status, setStatus] = useState<RouteStatus>('loading');
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No recap was requested.');
      setStatus('error');
      return;
    }

    // An unsent draft handed off from building.tsx needs no network round trip.
    const draft = getDraftRecap(id);
    if (draft) {
      setDaySummary(draft);
      setStatus('draft');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    getDaySummaryById(id)
      .then((summary) => {
        if (cancelled) return;
        if (summary) {
          setDaySummary(summary);
          setStatus('sent');
        } else {
          setError("Couldn't find that recap.");
          setStatus('error');
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Couldn't load that recap.");
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'error') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!daySummary) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return <RecapScreenContent daySummary={daySummary} readOnly={status === 'sent'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
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
  actionsSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
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
