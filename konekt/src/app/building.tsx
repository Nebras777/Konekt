import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockRoute } from '@/constants/mockRoute';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { setDraftRecap } from '../../services/draftRecap';
import { buildDayRecap } from '../../services/sendRecap';
import { getTodayPlaces } from '../../services/todayDraft';

const STEPS = [
  'Gathering today’s stops',
  'Calculating distance',
  'Selecting best photos',
  'Writing your recap',
];

// Visual pacing only — the checklist advances on this timer while the real
// pipeline runs, but never reaches the last step until it actually finishes.
const STEP_INTERVAL_MS = 700;

export default function BuildingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [completedCount, setCompletedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setCompletedCount(0);

    const stepTimers = STEPS.slice(0, -1).map((_, index) =>
      setTimeout(
        () => {
          if (!cancelled) setCompletedCount(index + 1);
        },
        STEP_INTERVAL_MS * (index + 1),
      ),
    );

    buildDayRecap(getTodayPlaces() ?? mockRoute)
      .then((summary) => {
        if (cancelled) return;
        setCompletedCount(STEPS.length);
        setDraftRecap(summary);
        router.replace(`/recap/${summary.id}`);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Could not build your recap');
      });

    return () => {
      cancelled = true;
      stepTimers.forEach(clearTimeout);
    };
  }, [router, attempt]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Building your recap</ThemedText>

        <View style={styles.checklist}>
          {STEPS.map((label, index) => {
            const done = index < completedCount;
            return (
              <View key={label} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    { borderColor: theme.textSecondary },
                    done && { backgroundColor: theme.text, borderColor: theme.text },
                  ]}>
                  {done ? (
                    <ThemedText type="small" themeColor="background">
                      {'✓'}
                    </ThemedText>
                  ) : null}
                </View>
                <ThemedText themeColor={done ? 'text' : 'textSecondary'}>{label}</ThemedText>
              </View>
            );
          })}
        </View>

        {error ? (
          <ThemedView type="backgroundElement" style={styles.errorCard}>
            <ThemedText themeColor="textSecondary">{error}</ThemedText>
            <Pressable onPress={() => setAttempt((a) => a + 1)} accessibilityRole="button">
              {({ pressed }) => (
                <ThemedView
                  type="backgroundSelected"
                  style={[styles.retryButton, pressed && styles.pressed]}>
                  <ThemedText type="smallBold">Try again</ThemedText>
                </ThemedView>
              )}
            </Pressable>
          </ThemedView>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.five,
    justifyContent: 'center',
  },
  checklist: {
    gap: Spacing.three,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  retryButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
