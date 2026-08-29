import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ConnectionRelationship } from '@/constants/types';

const RELATIONSHIPS: { value: ConnectionRelationship; label: string }[] = [
  { value: 'parent', label: 'Parent' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'partner', label: 'Partner' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
];

export default function AddPersonScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<ConnectionRelationship>('parent');

  const canSubmit = name.trim().length > 0 && phone.trim().length >= 6;

  function handleSubmit() {
    if (!canSubmit) return;
    // Next step wires this to the real invite-creation service.
    const draft = { name: name.trim(), phone: phone.trim(), relationship };
    console.log('new connection draft', draft);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Add person', presentation: 'modal' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText type="smallBold">Name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Mom"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Phone number</ThemedText>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+61 400 000 000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
              autoComplete="tel"
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Relationship</ThemedText>
            <View style={styles.pills}>
              {RELATIONSHIPS.map((option) => {
                const selected = option.value === relationship;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setRelationship(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}>
                    <ThemedView
                      type={selected ? 'backgroundSelected' : 'backgroundElement'}
                      style={[
                        styles.pill,
                        { borderColor: selected ? theme.text : theme.backgroundSelected },
                      ]}>
                      <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                        {option.label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
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
                <ThemedText type="smallBold">Send invite</ThemedText>
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
  form: {
    gap: Spacing.four,
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
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
    borderWidth: 1,
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
