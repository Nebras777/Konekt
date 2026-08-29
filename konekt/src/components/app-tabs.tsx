import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors, TabBarSurface } from '@/constants/theme';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={TabBarSurface}
      // The platform tints icons with its own default, which came out nearly as
      // dark as the bar itself. Set explicitly so they read as white.
      iconColor="#EDF3FF"
      indicatorColor="rgba(0,229,255,0.28)"
      labelStyle={{
        color: 'rgba(237,243,255,0.78)',
        selected: { color: '#FFFFFF' },
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
