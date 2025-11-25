import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { createWebViewHandlers, getAppDetailUri, INJECTED_JAVASCRIPT, SHARED_WEBVIEW_STYLES, WEBVIEW_COMMON_PROPS } from '@/constants/config';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useHideUI } from '../contexts/HideUIContext';

export default function MobilePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { setHideUI } = useHideUI();

  useFocusEffect(
    useCallback(() => {
      setHideUI(true);
      return () => setHideUI(false);
    }, [setHideUI])
  );

  if (!id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Invalid app ID</Text>
      </View>
    );
  }

  const handlers = createWebViewHandlers(router);
  const uri = getAppDetailUri(id as string);
  const colors = Colors[colorScheme || 'light'];
  const backgroundColor = colors.background;

  const styles = StyleSheet.create({
    ...SHARED_WEBVIEW_STYLES,
    frame: {
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#333' : '#ddd',
      borderRadius: 20,
      padding: 20,
      margin: 20,
      backgroundColor: colors.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  });

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor }}>
      <SafeAreaView 
        style={styles.container} 
        edges={['top', 'bottom']}
      >
        {Platform.OS === 'web' ? (
          <View style={styles.frame}>
            <iframe
              src={uri}
              style={{ flex: 1, width: '100%', border: 'none' }}
              title={`Mobile Preview ${id}`}
            />
          </View>
        ) : (
          <View style={styles.frame}>
            <WebView
              source={{ uri }}
              style={styles.webView}
              {...WEBVIEW_COMMON_PROPS}
              bounces={Platform.OS === 'ios'}
              scrollEnabled={true}
              injectedJavaScript={INJECTED_JAVASCRIPT}
              onShouldStartLoadWithRequest={handlers.onShouldStartLoadWithRequest}
              onMessage={handlers.onMessage}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create(SHARED_WEBVIEW_STYLES);