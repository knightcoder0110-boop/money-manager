import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/auth';
import { useAppStore } from '../src/store/app';
import { colors } from '../src/theme';
import { UpdateChecker } from '../src/components/UpdateChecker';
import { MilestoneCelebration } from '../src/components/MilestoneCelebration';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 2,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading, serverUrl } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAuthenticated = !!session;

    if (!serverUrl || !isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/lock');
      }
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, serverUrl, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { celebrationMilestone, dismissCelebration } = useAppStore();
  const scheme = useColorScheme();
  const theme = scheme === 'light' ? colors.light : colors.dark;

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
          'JetBrainsMono-Bold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
        });
      } catch {
        // Fall back to system fonts
      }
      await initialize();
      setFontsLoaded(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  // Set system UI to match app theme
  useEffect(() => {
    // Set the root background color so it shows behind transparent nav bar
    SystemUI.setBackgroundColorAsync(theme.background);
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync(scheme === 'light' ? 'dark' : 'light');
    }
  }, [scheme, theme.background]);

  if (!fontsLoaded || isLoading) {
    return <View style={[styles.loading, { backgroundColor: theme.background }]} />;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <QueryClientProvider client={queryClient}>
        <View style={[styles.flex, { backgroundColor: theme.background }]}>
          <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
          <UpdateChecker />
          <MilestoneCelebration
            visible={celebrationMilestone !== null}
            milestone={celebrationMilestone ?? 0}
            onDismiss={dismissCelebration}
          />
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.background },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="transactions/index" />
              <Stack.Screen
                name="transactions/[id]"
                options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
              />
              <Stack.Screen name="events/index" />
              <Stack.Screen
                name="events/new"
                options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
              />
              <Stack.Screen name="events/[id]" />
              <Stack.Screen name="categories/index" />
              <Stack.Screen name="categories/[id]" />
              <Stack.Screen
                name="categories/edit"
                options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
              />
              <Stack.Screen name="analytics/index" />
              <Stack.Screen name="settings/index" />
            </Stack>
          </AuthGate>
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { flex: 1 },
});
