import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Radii, Spacing, Surface } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

import {
  DEFAULT_PRIVACY_SETTINGS,
  getPrivacySettings,
  savePrivacySettings,
  type PrivacySettings,
} from '../../../services/privacySettings';
import { useTheme } from '@/hooks/use-theme';

const TOGGLES: { key: keyof PrivacySettings; label: string; hint?: string }[] = [
  {
    key: 'shareLocationWithFamily',
    label: 'Share location with family',
    hint: 'Off: people you filed as Family get your recap without the map or stops.',
  },
  {
    key: 'shareLocationWithFriends',
    label: 'Share location with friends',
    hint: 'Off: people you filed as Friends get your recap without the map or stops.',
  },
  {
    key: 'shareLocationWithOthers',
    label: 'Share location with others',
    hint: 'Off: people you filed as Other get your recap without the map or stops.',
  },
];

export default function PrivacyScreen() {
  const theme = useTheme();
  const { profile, signOut } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    getPrivacySettings(profile.id)
      .then((stored) => {
        if (!cancelled) setSettings(stored);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const toggle = useCallback(
    async (key: keyof PrivacySettings) => {
      if (!profile) return;
      const next = { ...settings, [key]: !settings[key] };
      setSettings(next); // optimistic — a switch should move under the thumb
      try {
        await savePrivacySettings(profile.id, next);
      } catch {
        setSettings(settings); // put it back if the write failed
      }
    },
    [profile, settings],
  );

  function confirmSignOut() {
    Alert.alert(
      'Log out?',
      "Your profile and everything you've sent stay saved. Stops you've captured today but not sent will be cleared from this phone.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
      ],
    );
  }

  return (
    <ThemedView gradient style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Privacy</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Your location stays on this phone until you send a recap.
          </ThemedText>
        </View>
        <ThemedView type="backgroundElement" style={styles.card}>
          {TOGGLES.map(({ key, label, hint }, index) => (
            <View
              key={key}
              style={[
                styles.row,
                index !== TOGGLES.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.backgroundSelected,
                },
              ]}>
              <View style={styles.rowLabel}>
                <ThemedText type="default">{label}</ThemedText>
                {hint && !settings[key] ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {hint}
                  </ThemedText>
                ) : null}
              </View>
              <Switch
                value={settings[key]}
                onValueChange={() => toggle(key)}
                disabled={!loaded || !profile}
                trackColor={{ true: theme.primary }}
              />
            </View>
          ))}
        </ThemedView>

        <View style={styles.accountBlock}>
          {profile ? (
            <ThemedText type="small" themeColor="textSecondary">
              Signed in as {profile.name}
            </ThemedText>
          ) : null}

          <Pressable onPress={confirmSignOut} accessibilityRole="button">
            {({ pressed }) => (
              <ThemedView
                type="backgroundElement"
                style={[styles.logoutButton, pressed && styles.pressed]}>
                <ThemedText type="smallBold">Log out</ThemedText>
              </ThemedView>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accountBlock: {
    gap: Spacing.two,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  card: {
    borderRadius: Radii.xl,
    borderWidth: Surface.borderWidth,
    borderColor: Surface.border,
    borderTopColor: Surface.borderStrong,
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  rowLabel: {
    flex: 1,
    gap: Spacing.half,
  },
});
