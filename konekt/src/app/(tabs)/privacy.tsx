import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

const TOGGLES = [
  'Share location with family',
  'Share location with friends',
  'Include photos in recaps',
];

export default function PrivacyScreen() {
  const theme = useTheme();
  const { profile, signOut } = useAuth();
  const [values, setValues] = useState<boolean[]>([false, false, false]);

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

  const toggle = (index: number) => {
    setValues((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Privacy</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Your location stays on this phone until you send a recap.
          </ThemedText>
        </View>
        <ThemedView type="backgroundElement" style={styles.card}>
          {TOGGLES.map((label, index) => (
            <View
              key={label}
              style={[
                styles.row,
                index !== TOGGLES.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.backgroundSelected,
                },
              ]}>
              <ThemedText type="default" style={styles.rowLabel}>
                {label}
              </ThemedText>
              <Switch
                value={values[index]}
                onValueChange={() => toggle(index)}
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
    borderRadius: Spacing.four,
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
  },
});
