import { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  // Ensure that reloading on `/login` keeps the app on `/login`
  anchor: 'login',
};

declare global {
  var setIsAuthenticatedGlobal: ((val: boolean) => void) | undefined;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const setAuth = async (value: boolean) => {
    try {
      await SecureStore.setItemAsync('zayren_is_authenticated', value ? 'true' : 'false');
    } catch (error) {
      console.warn('[Auth Persistence]', error);
    }
    setIsAuthenticated(value);
  };

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedValue = await SecureStore.getItemAsync('zayren_is_authenticated');
        setIsAuthenticated(savedValue === 'true');
      } catch (error) {
        console.warn('[Auth Persistence]', error);
      }
    };

    loadAuth();
  }, []);

  // Expose global setter for simple routing inside login screen
  useEffect(() => {
    global.setIsAuthenticatedGlobal = (value) => {
      void setAuth(value);
    };
    return () => {
      global.setIsAuthenticatedGlobal = undefined;
    };
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';

    // Perform checks on tick to ensure Router state is settled
    const timeout = setTimeout(() => {
      if (!isAuthenticated && inAuthGroup) {
        // Not logged in but trying to access tabs -> send to login
        router.replace('/login' as any);
      } else if (isAuthenticated && (
        (segments[0] as string) === 'login' ||
        (segments[0] as string) === 'register' ||
        (segments[0] as string) === 'register-password' ||
        (segments[0] as string) === 'verify' ||
        (segments[0] as string) === 'forgot-password' ||
        (segments[0] as string) === 'forgot-otp' ||
        (segments[0] as string) === 'reset-password'
      )) {
        // Logged in but on login/register/verify -> send to dashboard
        router.replace('/(tabs)');
      }
    }, 10);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="register-password" options={{ headerShown: false }} />
        <Stack.Screen name="verify" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-otp" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
