import { Tabs } from 'expo-router/js-tabs';

import { Colors, Radii, Surface } from '@/constants/theme';

/**
 * Uses the JS tab navigator rather than NativeTabs.
 *
 * NativeTabs renders a platform bar whose height, shape and position aren't
 * styleable — it can't be made slim, rounded or floating. The JS navigator
 * gives full control of tabBarStyle, at the cost of the platform's own icons,
 * which is why these are label-only.
 */
export default function AppTabs() {
  const colors = Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        // Hidden rather than absent: the navigator reserves icon space either
        // way, and collapsing it is what lets the bar be this slim.
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 18,
          height: 54,
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: Radii.pill,
          backgroundColor: 'rgba(22,22,30,0.94)',
          borderWidth: 1,
          borderColor: Surface.border,
          // The default bar draws a top hairline that reads as a seam once the
          // bar is detached from the screen edge.
          borderTopWidth: 1,
          borderTopColor: Surface.borderStrong,
          elevation: 12,
          shadowColor: Surface.shadow,
          shadowOpacity: 1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
        },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="recaps" options={{ title: 'Recaps' }} />
      <Tabs.Screen name="memorylane" options={{ title: 'Memories' }} />
      <Tabs.Screen name="people" options={{ title: 'People' }} />
      <Tabs.Screen name="privacy" options={{ title: 'Privacy' }} />
    </Tabs>
  );
}
