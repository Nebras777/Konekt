import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

import { getProfiles } from '../../services/profiles';

export default function WelcomeScreen() {
  const router = useRouter();
  // null = still checking whether any account exists at all.
  const [hasAccounts, setHasAccounts] = useState<boolean | null>(null);

  useEffect(() => {
    getProfiles()
      .then((profiles) => setHasAccounts(profiles.length > 0))
      .catch(() => setHasAccounts(false));
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/logo-wordmark.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
            Share your day, without the effort.
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/signup')} accessibilityRole="button">
            {({ pressed }) => (
              <ThemedView
                type="backgroundSelected"
                style={[styles.primaryButton, pressed && styles.pressed]}>
                <ThemedText type="smallBold">Sign up</ThemedText>
              </ThemedView>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push('/login')}
            disabled={!hasAccounts}
            accessibilityRole="button">
            {({ pressed }) => (
              <ThemedView
                type="backgroundElement"
                style={[
                  styles.secondaryButton,
                  pressed && styles.pressed,
                  !hasAccounts && styles.disabled,
                ]}>
                <ThemedText type="smallBold">
                  {hasAccounts ? 'Log in' : 'Log in (no accounts yet)'}
                </ThemedText>
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
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  logo: {
    width: 180,
    height: 180 * (681 / 1761),
  },
  tagline: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.two,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
});
