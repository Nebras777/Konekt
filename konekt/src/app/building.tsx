import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const STEPS = [
  'Gathering today’s stops',
  'Calculating distance',
  'Selecting best photos',
  'Writing your recap',
];

const DUMMY_RECAP_ID = 'demo-day-1';
const STEP_INTERVAL_MS = 500;

export default function BuildingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const stepTimeouts = STEPS.map((_, index) =>
      setTimeout(() => setCompletedCount(index + 1), STEP_INTERVAL_MS * (index + 1))
    );

    const navigationTimeout = setTimeout(
      () => router.replace('/recap/' + DUMMY_RECAP_ID),
      STEP_INTERVAL_MS * (STEPS.length + 1)
    );

    return () => {
      stepTimeouts.forEach(clearTimeout);
      clearTimeout(navigationTimeout);
    };
  }, [router]);

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
});
