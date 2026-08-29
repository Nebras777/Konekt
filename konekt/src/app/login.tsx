import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Profile } from '@/constants/types';
import { useAuth } from '@/hooks/use-auth';

import { getProfiles } from '../../services/profiles';

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signingInId, setSigningInId] = useState<string | null>(null);

  useEffect(() => {
    getProfiles()
      .then(setProfiles)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Could not load accounts');
        setProfiles([]);
      });
  }, []);

  async function handleSelect(profile: Profile) {
    setSigningInId(profile.id);
    try {
      await signIn(profile);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not log in');
      setSigningInId(null);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Log in', presentation: 'modal' }} />
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="small" themeColor="textSecondary">
          Choose your account
        </ThemedText>

        {profiles === null ? (
          <View style={styles.centered}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        ) : profiles.length === 0 ? (
          <ThemedText themeColor="textSecondary">No accounts yet — sign up first.</ThemedText>
        ) : (
          <View style={styles.list}>
            {profiles.map((profile) => (
              <Pressable
                key={profile.id}
                onPress={() => handleSelect(profile)}
                disabled={signingInId !== null}
                accessibilityRole="button">
                {({ pressed }) => (
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.row, pressed && styles.pressed]}>
                    <ThemedView type="backgroundSelected" style={styles.avatar}>
                      <ThemedText type="smallBold">{initials(profile.name)}</ThemedText>
                    </ThemedView>
                    <ThemedText type="smallBold" style={styles.rowText}>
                      {profile.name}
                    </ThemedText>
                    {signingInId === profile.id ? <ActivityIndicator /> : null}
                  </ThemedView>
                )}
              </Pressable>
            ))}
          </View>
        )}
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
    gap: Spacing.three,
  },
  centered: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
