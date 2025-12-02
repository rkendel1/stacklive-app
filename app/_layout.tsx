import { Stack } from 'expo-router';
import React from 'react';
// import { IAPProvider } from '../contexts/IAPContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        {/* <IAPProvider> */}
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
              <Stack.Screen name="profile" options={{ gestureEnabled: true }} />
              <Stack.Screen name="app-detail" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="returning-prompt" />
              <Stack.Screen name="splash" />
            </Stack>
          </GestureHandlerRootView>
        {/* </IAPProvider> */}
      </OnboardingProvider>
    </ThemeProvider>
  );
}