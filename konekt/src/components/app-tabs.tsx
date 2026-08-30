import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors, TabBarSurface } from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={TabBarSurface}
      // Ink, not white: the bar is white in this scheme, so the near-white
      // icons of the dark theme would have disappeared into it.
      iconColor={colors.text}
      indicatorColor="#EFF1F7"
      labelStyle={{
        color: colors.textSecondary,
        selected: { color: colors.text },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sun.max.fill" md="wb_sunny" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recaps">
        <NativeTabs.Trigger.Label>Recaps</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" md="history" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="memorylane">
        <NativeTabs.Trigger.Label>Memories</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="photo.on.rectangle" md="photo_library" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="people">
        <NativeTabs.Trigger.Label>People</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="people" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="privacy">
        <NativeTabs.Trigger.Label>Privacy</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="lock.fill" md="lock" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
