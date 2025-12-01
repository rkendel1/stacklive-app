import { Stack } from 'expo-router';
import React from 'react';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile" />
          <Stack.Screen name="app-detail" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="returning-prompt" />
          <Stack.Screen name="splash" />
        </Stack>
      </OnboardingProvider>
    </ThemeProvider>
  );
}