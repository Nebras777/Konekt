import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { PhotoGrid } from '@/components/PhotoGrid';
import RouteMap, { hasPosition } from '@/components/RouteMap';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { Spacing } from '@/constants/theme';
import type { ConnectionGroup, DaySummary } from '@/constants/types';
import { useTheme } from '@/hooks/use-theme';
import { mediaForPlace } from '@/utils/placeMedia';

import { clearDraftRecap, getDraftRecap } from '../../../services/draftRecap';
import { getContacts } from '../../../services/contacts';
import { getPrivacySettings } from '../../../services/privacySettings';
import { getDaySummaryById } from '../../../services/firestore';
import { sendRecapToConnections, totalDistanceKm } from '../../../services/sendRecap';

export type RecapScreenContentProps = {
  daySummary: DaySummary;
  /** True once this recap is already saved (e.g. viewed from someone's inbox) — hides editing/send. */
  readOnly?: boolean;
};

const GROUP_LABEL: Record<ConnectionGroup, string> = {
  family: 'Family',
  friends: 'Friends',
  other: 'Other',
};

export function RecapScreenContent({ daySummary, readOnly = false }: RecapScreenContentProps) {
  const router = useRouter();
  const theme = useTheme();
  const [excludedStops, setExcludedStops] = useState<Set<number>>(new Set());
  const { profile } = useAuth();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [note, setNote] = useState(daySummary.highlightNote ?? '');

  // Who this will actually go to. recipientId on the draft is a profile id (or
  // the demo fallback), so showing it raw put "family_demo" on the button.
  const [recipients, setRecipients] = useState<
    { name: string; group: ConnectionGroup; willSeeLocation: boolean }[]
  >([]);
  useEffect(() => {
    if (!profile || readOnly) {
      return;
    }
    let cancelled = false;
    Promise.all([getContacts(profile.id), getPrivacySettings(profile.id)])
      .then(([contacts, privacy]) => {
        if (cancelled) return;
        setRecipients(
          contacts
            .filter((c) => c.status === 'active' && c.profileId)
            .map((c) => {
              const group = c.group ?? 'other';
              return {
                name: c.name,
                group,
                willSeeLocation:
                  group === 'family'
                    ? privacy.shareLocationWithFamily
                    : group === 'friends'
                      ? privacy.shareLocationWithFriends
                      : privacy.shareLocationWithOthers,
              };
            }),
        );
      })
      .catch(() => {
        // Non-fatal: the button falls back to a generic label.
      });
    return () => {
      cancelled = true;
    };
  }, [profile, readOnly]);

  const sendLabel =
    recipients.length === 0
      ? 'Send'
      : recipients.length === 1
        ? `Send to ${recipients[0].name}`
        : `Send to ${recipients.length} people`;

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
  const photoCount = visiblePlaces.filter((place) => place.photoUrl || place.mediaUri).length;

  function handleCancel() {
    clearDraftRecap(daySummary.id);
    router.back();
  }

  async function handleSend() {
    if (!profile) {
      setSendError('Sign in before sending a recap.');
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      // Deliver one copy per accepted connection. getInbox() queries by
      // recipientId, so a recap can only reach one person per document.
      const { delivered, pending } = await sendRecapToConnections(
        {
          ...daySummary,
          places: visiblePlaces,
          distanceKm: totalDistanceKm(visiblePlaces),
          highlightNote: note.trim() || undefined,
        },
        profile.id,
      );

      if (delivered === 0) {
        setSendError(
          pending > 0
            ? `Nobody has accepted your invite yet — ${pending} still pending. They'll get your recaps once they accept.`
            : 'Invite someone on the People tab first, so there is somebody to send this to.',
        );
        setSending(false);
        return;
      }

      clearDraftRecap(daySummary.id);
      router.replace('/');
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Could not send this recap');
      setSending(false);
    }
  }

  return (
    <ThemedView gradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Today&apos;s Recap</ThemedText>
          <ThemedText themeColor="textSecondary">{daySummary.summaryText}</ThemedText>

          <View style={styles.statsRow}>
            <Stat label="km" value={distanceKm?.toFixed(1) ?? '—'} />
            <Stat label="stops" value={String(visiblePlaces.length)} />
            <Stat label="photos" value={String(photoCount)} />
          </View>

          {visiblePlaces.some(hasPosition) ? (
            <View style={styles.mapContainer}>
              <RouteMap places={visiblePlaces} interactive={false} />
            </View>
          ) : null}

          <View style={styles.stopsList}>
            {daySummary.places.map((place, index) => (
              <DayCard
                key={`${place.name}-${index}`}
                index={index}
                placeType={place.type}
                time={place.time}
                title={place.name}
                subtitle={place.subtitle}
                excluded={excludedStops.has(index)}
                onToggleExclude={readOnly ? undefined : () => toggleExcluded(index)}>
                <PhotoGrid photos={mediaForPlace(place)} />
              </DayCard>
            ))}
          </View>

          {readOnly ? (
            daySummary.highlightNote ? (
              <ThemedView type="backgroundElement" style={styles.noteCard}>
                <ThemedText type="smallBold">Highlight</ThemedText>
                <ThemedText themeColor="textSecondary">{daySummary.highlightNote}</ThemedText>
              </ThemedView>
            ) : null
          ) : (
            <View style={styles.noteSection}>
              <ThemedText type="smallBold">Add a highlight (optional)</ThemedText>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="What was the best part of your day?"
                placeholderTextColor={theme.textSecondary}
                multiline
                style={[
                  styles.noteInput,
                  { color: theme.text, backgroundColor: theme.backgroundElement },
                ]}
              />
            </View>
          )}

          {!readOnly ? (
            <View style={styles.actionsSection}>
              {recipients.length > 0 ? (
                <ThemedView type="backgroundElement" style={styles.previewCard}>
                  <ThemedText type="smallBold">Who gets what</ThemedText>
                  {recipients.map((r) => (
                    <View key={r.name} style={styles.previewRow}>
                      <ThemedText type="small" style={styles.previewName}>
                        {r.name}{' '}
                        <ThemedText type="small" themeColor="textSecondary">
                          ({GROUP_LABEL[r.group]})
                        </ThemedText>
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {r.willSeeLocation ? 'map + photos' : 'photos only'}
                      </ThemedText>
                    </View>
                  ))}
                  {recipients.some((r) => !r.willSeeLocation) ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      Location is left out for some people, based on your Privacy settings.
                      Their copy is sent without it.
                    </ThemedText>
                  ) : null}
                </ThemedView>
              ) : null}

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
                        {sending ? 'Sending…' : sendLabel}
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
  noteCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  noteSection: {
    gap: Spacing.two,
  },
  noteInput: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actionsSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  previewCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  previewName: {
    flexShrink: 1,
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
