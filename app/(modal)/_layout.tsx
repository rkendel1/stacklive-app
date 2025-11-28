import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="webview"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          headerShown: false,
          gestureEnabled: false, // We handle gestures ourselves
        }}
      />
    </Stack>
  );
}