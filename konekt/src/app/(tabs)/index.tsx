import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { PhotoGrid } from '@/components/PhotoGrid';
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
import { mockRoute } from '@/constants/mockRoute';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { PlaceVisit } from '@/constants/types';

import { setTodayPlaces } from '../../../services/todayDraft';

type AttachedMedia = { uri: string; type: 'photo' | 'video' };

export default function TodayScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<Record<number, AttachedMedia>>({});

  const photoCount =
    mockRoute.filter((place) => place.photoUrl).length +
    Object.keys(media).length;

  const stats = {
    km: TODAY_DISTANCE_KM.toFixed(1),
    stops: String(TODAY_PLACES.length),
    photos: String(TODAY_PLACES.filter((place) => place.photoUrl).length),
    stops: String(mockRoute.length),
    photos: String(photoCount),
  };

  async function attachMedia(index: number) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo library access to attach a photo or video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    setMedia((prev) => ({
      ...prev,
      [index]: { uri: asset.uri, type: asset.type === 'video' ? 'video' : 'photo' },
    }));
  }

  function removeMedia(index: number) {
    setMedia((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  function handleMakeRecap() {
    const placesWithMedia: PlaceVisit[] = mockRoute.map((place, index) => {
      const attached = media[index];
      if (!attached) return place;
      return { ...place, mediaUri: attached.uri, mediaType: attached.type };
    });
    setTodayPlaces(placesWithMedia);
    router.push('/building');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Today
          </ThemedText>

          <View style={styles.statsRow}>
            <Stat label="km" value={stats.km} />
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
            {mockRoute.map((place, index) => {
              const attached = media[index];
              return (
                <DayCard
                  key={`${place.name}-${index}`}
                  time={place.time}
                  title={place.name}
                  subtitle={place.subtitle}>
                  {attached ? (
                    <>
                      <PhotoGrid photos={[attached]} />
                      <Pressable onPress={() => removeMedia(index)} accessibilityRole="button">
                        {({ pressed }) => (
                          <ThemedText
                            type="small"
                            themeColor="textSecondary"
                            style={pressed ? styles.pressed : undefined}>
                            Remove
                          </ThemedText>
                        )}
                      </Pressable>
                    </>
                  ) : (
                    <Pressable onPress={() => attachMedia(index)} accessibilityRole="button">
                      {({ pressed }) => (
                        <ThemedView
                          type="backgroundSelected"
                          style={[styles.attachButton, pressed && styles.pressed]}>
                          <ThemedText type="small">+ Add photo or video</ThemedText>
                        </ThemedView>
                      )}
                    </Pressable>
                  )}
                </DayCard>
              );
            })}
            {TODAY_PLACES.map((place, index) => (
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

        <Pressable onPress={handleMakeRecap} accessibilityRole="button">
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
  attachButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
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
