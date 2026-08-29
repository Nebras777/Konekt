import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useDayRoute } from '@/hooks/use-day-route';

export default function TodayScreen() {
  const router = useRouter();

  // Whatever the user has actually captured today. Empty until they capture.
  const { route, isEmpty, endDay, capture, isCapturing, error } = useDayRoute();

  function confirmEndDay() {
    Alert.alert(
      'End your day?',
      `This clears today's ${route.length} stop${route.length === 1 ? '' : 's'} from this device. Recaps you've already sent are kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End day', style: 'destructive', onPress: endDay },
      ],
    );
  }

  const stats = {
    stops: String(route.length),
    photos: String(route.filter((place) => place.photoUrl).length),
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Image
          source={require('@/assets/images/logo-wordmark.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statsRow}>
            <Stat label="stops" value={stats.stops} />
            <Stat label="photos" value={stats.photos} />
          </View>

          {isEmpty ? (
            <ThemedText type="small" themeColor="textSecondary">
              No stops yet. Capture a location to start your day.
            </ThemedText>
          ) : null}

          {error ? (
            <ThemedText type="small" themeColor="textSecondary">
              {error}
            </ThemedText>
          ) : null}

          <Pressable onPress={capture} disabled={isCapturing} accessibilityRole="button">
            {({ pressed }) => (
              <ThemedView
                type="backgroundSelected"
                style={[styles.captureButton, (pressed || isCapturing) && styles.pressed]}>
                <ThemedText type="smallBold">
                  {isCapturing ? 'Finding you…' : 'Capture this place'}
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>

          <View style={styles.stopsList}>
            {route.map((place, index) => (
              <DayCard
                key={`${place.name}-${index}`}
                time={place.time}
                title={place.name}
                subtitle={place.subtitle}
              />
            ))}
          </View>
        </ScrollView>

        <Pressable onPress={() => router.push('/building')} accessibilityRole="button">
          {({ pressed }) => (
            <ThemedView
              type="backgroundSelected"
              style={[styles.recapButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold">Make today&apos;s recap</ThemedText>
            </ThemedView>
          )}
        </Pressable>

        {!isEmpty ? (
          <Pressable onPress={confirmEndDay} accessibilityRole="button">
            {({ pressed }) => (
              <ThemedView
                type="backgroundElement"
                style={[styles.endDayButton, pressed && styles.pressed]}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  End day
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        ) : null}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  captureButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  endDayButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    marginTop: Spacing.two,
  },
  safeArea: {
    flex: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  logo: {
    height: 38,
    width: 38 * (1761 / 681),
    alignSelf: 'flex-start',
  },
  content: {
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
  stopsList: {
    gap: Spacing.two,
  },
  recapButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
