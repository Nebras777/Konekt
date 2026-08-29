import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemedView } from '@/components/themed-view';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { profile, loading } = useAuth();

  if (loading) {
    // AnimatedSplashOverlay is already covering this; avoid flashing a route
    // before we know whether there's a signed-in profile.
    return <ThemedView style={{ flex: 1 }} />;
  }

  return (
    <Stack>
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
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
