import AppScreenshotsCarousel from '@/components/AppScreenshotsCarousel';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { APP_DATA, INJECTED_JAVASCRIPT, SHARED_WEBVIEW_STYLES, WEBVIEW_COMMON_PROPS, createWebViewHandlers, getWebViewAppDetailUri } from '@/constants/config';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useHideUI } from '../contexts/HideUIContext';

export default function AppDetailScreen() {
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

  const appData = APP_DATA[id as string];
  const handlers = createWebViewHandlers(router);
  const uri = getWebViewAppDetailUri(id as string, colorScheme ? colorScheme as 'light' | 'dark' : undefined);
  const colors = Colors[colorScheme || 'light'];
  const backgroundColor = colors.background;

  const styles = StyleSheet.create({
    ...SHARED_WEBVIEW_STYLES,
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee',
      backgroundColor: colors.background,
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 12,
      color: colors.text,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 8,
    },
    description: {
      padding: 16,
      fontSize: 16,
      lineHeight: 24,
      color: colorScheme === 'dark' ? colors.text : '#666',
    },
    screenshots: {
      padding: 16,
    },
    webviewContainer: {
      flex: 1,
      minHeight: 300,
    },
  });

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor }}>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ fontSize: 18, color: colorScheme === 'dark' ? colors.text : Colors.light.tint }}>←</Text>
          </TouchableOpacity>
          {appData?.icon && <Image source={appData.icon} style={styles.icon} />}
          <Text style={styles.title}>{appData?.name || 'App Detail'}</Text>
        </View>

        {/* Description */}
        {appData?.description && <Text style={styles.description}>{appData.description}</Text>}

        {/* Screenshots */}
        {appData?.screenshots && appData.screenshots.length > 0 && (
          <View style={styles.screenshots}>
            <AppScreenshotsCarousel screenshots={appData.screenshots} onClose={() => {}} />
          </View>
        )}

        {/* WebView Section */}
        <SafeAreaView edges={['bottom']} style={styles.webviewContainer}>
          {Platform.OS === 'web' ? (
            <iframe
              src={uri}
              style={{ flex: 1, width: '100%', border: 'none' }}
              title={`App Detail ${id}`}
            />
          ) : (
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
          )}
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create(SHARED_WEBVIEW_STYLES);