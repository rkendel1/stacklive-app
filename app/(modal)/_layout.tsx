import { Stack } from 'expo-router';
import React from 'react';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
      <Stack.Screen
        name="webview"
        options={{ presentation: 'fullScreenModal', headerShown: false }}
      />
    </Stack>
  );
}