import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { mockRoute } from '@/constants/mockRoute';

export default function TodayScreen() {
  const router = useRouter();

  const stats = {
    stops: String(mockRoute.length),
    photos: String(mockRoute.filter((place) => place.photoUrl).length),
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

          <View style={styles.stopsList}>
            {mockRoute.map((place, index) => (
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
