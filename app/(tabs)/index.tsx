import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

export default function TabOneScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const colorScheme = useColorScheme();

  // Detect correct Expo LAN host or use fallback local IP
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const host = expoHost || '192.168.1.204';

  // Base URL for home screen
  const baseUri = `http://${host}:3000/preview`;

  // Merge search query if present
  const uri = searchQuery
    ? `${baseUri}?q=${encodeURIComponent(searchQuery)}`
    : baseUri;

  const handleScroll = (event: any) => {
    const { y: currentY } = event.nativeEvent.contentOffset;
    const delta = currentY - lastScrollY.current;
    if (Math.abs(delta) > 10) {
      const toValue = delta > 0 ? -headerHeight : 0;
      Animated.spring(headerTranslateY, {
        toValue,
        tension: 300,
        friction: 30,
        useNativeDriver: true,
      }).start();
      lastScrollY.current = currentY;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#f8f9fa',
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
      >
        <TextInput
          style={[styles.searchInput, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f9f9f9', color: colorScheme === 'dark' ? '#fff' : '#000' }]}
          placeholder="Search apps"
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.profileContainer} onPress={() => router.push('/profile')}>
          <View style={[styles.profileAvatar, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri }}
          style={styles.webView}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          bounces={Platform.OS === 'ios'}
          scrollEnabled={true}
          scalesPageToFit={false}
          injectedJavaScript="document.documentElement.style.height = '100vh'; document.body.style.height = '100vh'; document.body.style.overflowY = 'scroll'; true;"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  profileContainer: {
    marginLeft: 'auto',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});