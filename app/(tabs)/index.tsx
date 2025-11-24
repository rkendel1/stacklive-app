import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();

  // Detect correct Expo LAN host or fallback
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const host = expoHost || '192.168.1.204';
  const baseUri = `http://${host}:3000/preview`;
  const uri = searchQuery ? `${baseUri}?q=${encodeURIComponent(searchQuery)}` : baseUri;

  // Intercept /app/ links to push new detail page
  const handleShouldStartLoadWithRequest = (request: any) => {
    if (request.url.includes('/app/')) {
      const match = request.url.match(/\/app\/([^/?#]+)/);
      if (match) {
        router.push(`/modal?id=${match[1]}`);
        return false;
      }
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colorScheme === 'dark' ? '#333' : '#f9f9f9',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          placeholder="Search apps..."
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.profileContainer} onPress={() => router.push('/profile')}>
          <View style={[styles.profileAvatar, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.webViewContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={uri}
            style={{ flex: 1, width: '100%', border: 'none' }}
            title="Home Preview"
          />
        ) : (
          <WebView
            source={{ uri }}
            style={styles.webView}
            originWhitelist={['*']}
            mixedContentMode="compatibility"
            javaScriptEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState
            bounces={Platform.OS === 'ios'}
            scrollEnabled
            scalesPageToFit={false}
            injectedJavaScript="document.documentElement.style.height = '100vh'; document.body.style.height = '100vh'; document.body.style.overflowY = 'scroll'; true;"
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  profileContainer: { marginLeft: 'auto' },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  webViewContainer: { flex: 1 },
  webView: { flex: 1 },
});