import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { PlaceVisit } from '@/constants/types';

const TODAY_DISTANCE_KM = 4.6;

const TODAY_PLACES: PlaceVisit[] = [
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
];

export default function TodayScreen() {
  const router = useRouter();

  const stats = {
    km: TODAY_DISTANCE_KM.toFixed(1),
    stops: String(TODAY_PLACES.length),
    photos: String(TODAY_PLACES.filter((place) => place.photoUrl).length),
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Today
          </ThemedText>

          <View style={styles.statsRow}>
            <Stat label="km" value={stats.km} />
            <Stat label="stops" value={stats.stops} />
            <Stat label="photos" value={stats.photos} />
          </View>

          <View style={styles.stopsList}>
            {TODAY_PLACES.map((place, index) => (
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
    paddingBottom: BottomTabInset,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    marginBottom: Spacing.two,
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
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
