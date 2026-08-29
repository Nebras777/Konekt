import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recap/[id]" options={{ title: 'Recap' }} />
        <Stack.Screen name="building" options={{ title: 'Building' }} />
        <Stack.Screen
          name="add-person"
          options={{ title: 'Add person', presentation: 'modal' }}
        />
        <Stack.Screen
          name="signup"
          options={{ title: 'Create profile', presentation: 'modal' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
