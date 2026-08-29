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
        <ThemedText type="title">Privacy</ThemedText>
        <View style={styles.list}>
          {TOGGLES.map((label, index) => (
            <ThemedView key={label} type="backgroundElement" style={styles.row}>
              <ThemedText type="default" style={styles.rowLabel}>
                {label}
              </ThemedText>
              <Switch
                value={values[index]}
                onValueChange={() => toggle(index)}
                trackColor={{ true: theme.primary }}
              />
            </ThemedView>
          ))}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  list: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  rowLabel: {
    flex: 1,
  },
});
