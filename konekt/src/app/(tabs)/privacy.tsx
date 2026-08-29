import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TOGGLES = [
  'Share location with family',
  'Share location with friends',
  'Include photos in recaps',
  'Show exact addresses',
  'Pause sharing overnight',
];

export default function PrivacyScreen() {
  const theme = useTheme();
  const [values, setValues] = useState<boolean[]>([true, false, true, false, true]);

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
