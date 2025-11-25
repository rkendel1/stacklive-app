// app/_layout.tsx
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { APP_DETAIL_CONFIG } from '@/constants/config';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HideUIProvider } from '../contexts/HideUIContext';
import { ThemeProvider as ThemeOverrideProvider } from '../contexts/ThemeContext';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeOverrideProvider initialOverride="light">
      <RootLayoutNav />
    </ThemeOverrideProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      ...(colorScheme === 'dark' ? Colors.dark : Colors.light),
    },
  };

  return (
    <HideUIProvider>
      <NavigationThemeProvider value={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="app-detail" 
            options={{ 
              presentation: APP_DETAIL_CONFIG.type,
              headerShown: false,
              animation: APP_DETAIL_CONFIG.animation
            }} 
          />
            <Stack.Screen 
              name="profile" 
              options={{ 
                presentation: 'modal', 
                headerShown: false 
              }} 
            />
          </Stack>
        </GestureHandlerRootView>
      </NavigationThemeProvider>
    </HideUIProvider>
  );
}