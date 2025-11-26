import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebViewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();

  if (!url) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-red-500 dark:text-red-400">No URL provided for WebView.</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: url as string }}
      style={{ flex: 1 }}
      startInLoadingState={false}
      scalesPageToFit={true}
    />
  );
}