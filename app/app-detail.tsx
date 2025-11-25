import AppScreenshotsCarousel from '@/components/AppScreenshotsCarousel';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { APP_DATA, APP_DETAIL_CONFIG, INJECTED_JAVASCRIPT, SHARED_WEBVIEW_STYLES, WEBVIEW_COMMON_PROPS, createWebViewHandlers, getWebViewAppDetailUri } from '@/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useHideUI } from '../contexts/HideUIContext';

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { setHideUI, setHideSearchBar } = useHideUI();
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    setHideUI(APP_DETAIL_CONFIG.hideTabs);
    setHideSearchBar(APP_DETAIL_CONFIG.hideSearch);
    StatusBar.setHidden(true);
    return () => {
      setHideUI(false);
      setHideSearchBar(false);
      StatusBar.setHidden(false);
    };
  }, [setHideUI, setHideSearchBar]);

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

  const webviewContainerStyle = APP_DETAIL_CONFIG.height !== undefined 
    ? { flex: 1, height: APP_DETAIL_CONFIG.height } 
    : { flex: 1, minHeight: 300 };

  const styles = StyleSheet.create({
    ...SHARED_WEBVIEW_STYLES,
    fullScreenOverlay: {
      flex: 1,
      backgroundColor,
    },
    safeArea: {
      flex: 1,
      backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee',
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    starButton: {
      padding: 8,
    },
    contentContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    appInfo: {
      padding: 16,
      backgroundColor: colors.background,
    },
    appHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    appIcon: {
      width: 80,
      height: 80,
      borderRadius: 16,
      backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    appIconText: {
      fontSize: 32,
    },
    appDetails: {
      flex: 1,
    },
    appName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    appCategory: {
      fontSize: 16,
      color: '#007AFF',
      marginBottom: 8,
    },
    appStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    ratingText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 4,
    },
    userCount: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#999' : '#666',
    },
    description: {
      padding: 16,
      fontSize: 16,
      lineHeight: 24,
      color: colorScheme === 'dark' ? colors.text : '#666',
    },
    tagsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    tag: {
      backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
    },
    tagText: {
      fontSize: 14,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
    },
    screenshots: {
      padding: 16,
    },
    webviewContainer: webviewContainerStyle,
    launchButtonContainer: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingBottom: insets.bottom + 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#333' : '#eee',
    },
    launchButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    launchButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  return (
    <View style={styles.fullScreenOverlay}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Details</Text>
          <TouchableOpacity style={styles.starButton}>
            <Ionicons name="star-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
          {/* App Info Section */}
          <View style={styles.appInfo}>
            <View style={styles.appHeader}>
              <View style={styles.appIcon}>
                <Text style={styles.appIconText}>🎨</Text>
              </View>
              <View style={styles.appDetails}>
                <Text style={styles.appName}>Pixel Art Studio</Text>
                <Text style={styles.appCategory}>Creative</Text>
                <View style={styles.appStats}>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                  <Text style={styles.userCount}>12K users</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Create stunning pixel art. Experience powerful features designed to enhance your productivity and creativity. Built with modern technology for smooth performance.
          </Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>#Creative</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Editor's Choice</Text>
            </View>
          </View>

          {/* Screenshots Section */}
          <Text style={styles.sectionTitle}>Screenshots</Text>
          {appData?.screenshots && appData.screenshots.length > 0 && (
            <View style={styles.screenshots}>
              <AppScreenshotsCarousel screenshots={appData.screenshots} onClose={() => {}} />
            </View>
          )}

          {/* WebView Section */}
          <View style={styles.webviewContainer}>
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
          </View>
        </ScrollView>

        {/* Launch App Button */}
        <View style={styles.launchButtonContainer}>
          <TouchableOpacity style={styles.launchButton} activeOpacity={0.8}>
            <Ionicons name="flash" size={24} color="white" />
            <Text style={styles.launchButtonText}>Launch App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create(SHARED_WEBVIEW_STYLES);