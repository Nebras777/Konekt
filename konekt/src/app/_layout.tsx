import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemedView } from '@/components/themed-view';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Colors } from '@/constants/theme';

/**
 * Navigation paints its own screen backgrounds, which would sit over the
 * gradient. Transparent here lets it through; card and text keep headers and
 * modals in the dark palette rather than the navigator's default white.
 */
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: Colors.light.backgroundElement,
    text: Colors.light.text,
    border: Colors.light.backgroundSelected,
    primary: Colors.light.primary,
  },
};

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { profile, loading } = useAuth();

  if (loading) {
    // AnimatedSplashOverlay is already covering this; avoid flashing a route
    // before we know whether there's a signed-in profile.
    return <ThemedView style={{ flex: 1 }} />;
  }

  return (
    <>
      {/* Dark icons: the page is pale, and light icons vanish on it. */}
      <StatusBar style="dark" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Protected guard={!!profile}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recap/[id]" options={{ title: 'Recap' }} />
        <Stack.Screen name="building" options={{ title: 'Building' }} />
        <Stack.Screen
          name="add-person"
          options={{ title: 'Add person', presentation: 'modal' }}
        />
        <Stack.Screen
          name="activity"
          options={{ title: 'Activity', presentation: 'modal' }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!profile}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen
        name="signup"
        options={{ title: 'Create profile', presentation: 'modal' }}
      />
        <Stack.Screen name="login" options={{ title: 'Log in', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <AnimatedSplashOverlay />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

