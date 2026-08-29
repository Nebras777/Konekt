import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { createProfile } from '../../services/profiles';

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createProfile(name.trim());
      router.back();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not create your profile');
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Create profile', presentation: 'modal' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.form}>
          <ThemedText type="subtitle">Create your profile</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Just your name for now — this connects to People later.
          </ThemedText>

          <View style={styles.field}>
            <ThemedText type="smallBold">Name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sebti"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          {submitError ? (
            <ThemedText type="small" themeColor="textSecondary">
              {submitError}
            </ThemedText>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              onPress={() => router.back()}
              disabled={submitting}
              accessibilityRole="button">
              {({ pressed }) => (
                <ThemedView
                  type="backgroundElement"
                  style={[styles.secondaryButton, pressed && styles.pressed]}>
                  <ThemedText type="smallBold">Cancel</ThemedText>
                </ThemedView>
              )}
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              style={styles.primaryWrapper}>
              {({ pressed }) => (
                <ThemedView
                  type="backgroundSelected"
                  style={[
                    styles.primaryButton,
                    pressed && styles.pressed,
                    !canSubmit && styles.disabled,
                  ]}>
                  <ThemedText type="smallBold">
                    {submitting ? 'Creating…' : 'Create profile'}
                  </ThemedText>
                </ThemedView>
              )}
            </Pressable>
          </View>
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
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  footer: {
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  primaryWrapper: {
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
