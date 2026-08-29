import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { PhotoGrid } from '@/components/PhotoGrid';
import RouteMap from '@/components/RouteMap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { DaySummary } from '@/constants/types';
import { useAuth } from '@/hooks/use-auth';
import { mediaForPlace } from '@/utils/placeMedia';

import { getInbox } from '../../../services/firestore';
import { getSavedRecapIds, saveRecap, unsaveRecap } from '../../../services/savedRecaps';

const REACTIONS = ['Love it', 'Proud', 'Call me'] as const;

export default function RecapsScreen() {
  const { profile, loading: profileLoading } = useAuth();
  // null = still loading, [] = loaded but empty
  const [summaries, setSummaries] = useState<DaySummary[] | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) {
      return;
    }
    setError(null);
    try {
      // Recaps other people addressed to this profile, plus which of them this
      // profile has saved.
      const [inbox, saved] = await Promise.all([
        getInbox(profile.id),
        getSavedRecapIds(profile.id),
      ]);
      setSummaries(inbox);
      setSavedIds(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load recaps');
      setSummaries([]);
    }
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSaved = useCallback(
    async (summaryId: string) => {
      if (!profile) return;
      const wasSaved = savedIds.has(summaryId);

      // Optimistic: a bookmark should respond instantly, and the worst case is
      // a stale icon that the next load corrects.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.delete(summaryId);
        } else {
          next.add(summaryId);
        }
        return next;
      });

      try {
        await (wasSaved
          ? unsaveRecap(profile.id, summaryId)
          : saveRecap(profile.id, summaryId));
      } catch {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) {
            next.add(summaryId);
          } else {
            next.delete(summaryId);
          }
          return next;
        });
      }
    },
    [profile, savedIds],
  );

  const visible = (summaries ?? []).filter((s) => !showSavedOnly || savedIds.has(s.id));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Recaps</ThemedText>

        {summaries && summaries.length > 0 ? (
          <View style={styles.filterRow}>
            {([false, true] as const).map((savedOnly) => {
              const active = showSavedOnly === savedOnly;
              const label = savedOnly ? `Saved (${savedIds.size})` : 'All';
              return (
                <Pressable
                  key={label}
                  onPress={() => setShowSavedOnly(savedOnly)}
                  accessibilityRole="button">
                  {({ pressed }) => (
                    <ThemedView
                      type={active ? 'backgroundSelected' : 'backgroundElement'}
                      style={[styles.filterChip, pressed && styles.pressed]}>
                      <ThemedText type="smallBold">{label}</ThemedText>
                    </ThemedView>
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {profileLoading ? (
          <View style={styles.centre}>
            <ActivityIndicator />
          </View>
        ) : !profile ? (
          <Message text="Sign in to see recaps people have shared with you." />
        ) : summaries === null ? (
          <View style={styles.centre}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <Message text={error} />
        ) : summaries.length === 0 ? (
          <Message text="No recaps yet. When someone sends you their day, it shows up here." />
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              showSavedOnly ? (
                <Message text="Nothing saved yet. Tap Save on a recap to keep it here." />
              ) : null
            }
            renderItem={({ item }) => (
              <InboxRecap
                summary={item}
                saved={savedIds.has(item.id)}
                onToggleSave={() => toggleSaved(item.id)}
              />
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

/** One received recap, rendered read-only, with a reaction row on top. */
function InboxRecap({
  summary,
  saved,
  onToggleSave,
}: {
  summary: DaySummary;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const photoCount = summary.places.filter((place) => place.photoUrl || place.mediaUri).length;

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

      <View style={styles.titleRow}>
        <ThemedText type="subtitle" style={styles.titleText}>
          {summary.senderName ?? summary.userId}&apos;s day
        </ThemedText>
        <Pressable
          onPress={onToggleSave}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved' : 'Save this recap'}>
          {({ pressed }) => (
            <ThemedView
              type={saved ? 'backgroundSelected' : 'backgroundElement'}
              style={[styles.saveChip, pressed && styles.pressed]}>
              <ThemedText type="smallBold">{saved ? '★ Saved' : '☆ Save'}</ThemedText>
            </ThemedView>
          )}
        </Pressable>
      </View>
      <ThemedText themeColor="textSecondary">{summary.summaryText}</ThemedText>

      {summary.highlightNote ? (
        <ThemedView type="backgroundSelected" style={styles.noteCard}>
          <ThemedText type="smallBold">Highlight</ThemedText>
          <ThemedText themeColor="textSecondary">{summary.highlightNote}</ThemedText>
        </ThemedView>
      ) : null}

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
            <PhotoGrid photos={mediaForPlace(place)} />
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
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleText: {
    flexShrink: 1,
  },
  saveChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
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
  noteCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
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
