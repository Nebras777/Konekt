import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BellIcon } from '@/components/bell-icon';
import { DayCard } from '@/components/DayCard';
import { PhotoGrid } from '@/components/PhotoGrid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccentList, Danger, Radii, Spacing, Surface } from '@/constants/theme';
import type { PlaceVisit } from '@/constants/types';
import { useDayRoute } from '@/hooks/use-day-route';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';

import { getReactionsForOwner } from '../../../services/reactions';

import { totalDistanceKm } from '../../../services/sendRecap';
import { setTodayPlaces } from '../../../services/todayDraft';

type AttachedMedia = { uri: string; type: 'photo' | 'video' };

export default function TodayScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const theme = useTheme();

  // Unread count for the bell. The list itself lives on the activity screen.
  const [unseenCount, setUnseenCount] = useState(0);

  const loadActivity = useCallback(async () => {
    if (!profile) return;
    try {
      const reactions = await getReactionsForOwner(profile.id);
      setUnseenCount(reactions.filter((r) => !r.seen).length);
    } catch {
      // Activity is a nice-to-have; a failure shouldn't blank the screen.
    }
  }, [profile]);

  // Refresh on focus so a reaction left while you were on another tab appears.
  useFocusEffect(
    useCallback(() => {
      loadActivity();
    }, [loadActivity]),
  );


  const [media, setMedia] = useState<Record<number, AttachedMedia>>({});

  // Whatever the user has actually captured today. Empty until they capture.
  const { route, isEmpty, endDay, capture, isCapturing, error } = useDayRoute();

  const photoCount =
    route.filter((place) => place.photoUrl).length + Object.keys(media).length;

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
    km: totalDistanceKm(route).toFixed(1),
    stops: String(route.length),
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
    const placesWithMedia: PlaceVisit[] = route.map((place, index) => {
      const attached = media[index];
      if (!attached) return place;
      return { ...place, mediaUri: attached.uri, mediaType: attached.type };
    });
    setTodayPlaces(placesWithMedia);
    router.push('/building');
  }

  return (
    <ThemedView gradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <Image
            source={require('@/assets/images/logo-wordmark.png')}
            style={styles.logo}
            contentFit="contain"
          />

          <Pressable
            onPress={() => router.push('/activity')}
            accessibilityRole="button"
            accessibilityLabel={
              unseenCount > 0 ? `Activity, ${unseenCount} unread` : 'Activity'
            }>
            {({ pressed }) => (
              <View style={[styles.bellWrapper, pressed && styles.pressed]}>
                <BellIcon color={theme.textSecondary} />
                {unseenCount > 0 ? (
                  <ThemedView type="backgroundSelected" style={styles.badge}>
                    <ThemedText type="small">{unseenCount > 9 ? '9+' : unseenCount}</ThemedText>
                  </ThemedView>
                ) : null}
              </View>
            )}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statsRow}>
            <Stat label="km" value={stats.km} accent={AccentList[0]} tilt="-1.5deg" />
            <Stat label="stops" value={stats.stops} accent={AccentList[1]} tilt="1deg" />
            <Stat label="photos" value={stats.photos} accent={AccentList[2]} tilt="-0.8deg" />
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
            {route.map((place, index) => {
              const attached = media[index];
              return (
                <DayCard
                  key={`${place.name}-${index}`}
                  index={index}
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

        {!isEmpty ? (
          <Pressable onPress={confirmEndDay} accessibilityRole="button">
            {({ pressed }) => (
              <View style={[styles.endDayButton, pressed && styles.pressed]}>
                <ThemedText type="smallBold" style={{ color: Danger.text }}>
                  End day
                </ThemedText>
              </View>
            )}
          </Pressable>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function Stat({
  label,
  value,
  accent,
  tilt,
}: {
  label: string;
  value: string;
  accent: string;
  tilt: string;
}) {
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.statTile, { borderColor: accent, transform: [{ rotate: tilt }] }]}>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bellWrapper: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  captureButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.pill,
  },
  endDayButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.pill,
    backgroundColor: Danger.fill,
    borderWidth: Surface.borderWidth,
    borderColor: Danger.border,
    marginTop: Spacing.two,
  },
  safeArea: {
    flex: 1,
    // The native tab bar occupies its own layout space, so reserving a full
    // BottomTabInset on top of it left the buttons floating high above it.
    paddingBottom: Spacing.four,
  },
  logo: {
    width: 140,
    height: 32,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
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
    borderWidth: 2,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.three,
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
    // Clear of the list above so the cards stay readable.
    marginTop: Spacing.five,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radii.pill,
    borderWidth: Surface.borderWidth,
    borderColor: Surface.border,
  },
  pressed: {
    opacity: 0.7,
  },
});
