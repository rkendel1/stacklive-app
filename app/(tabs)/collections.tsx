// Update in all tab screens: index.tsx, trending.tsx, my-apps.tsx, collections.tsx

import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

export default function TrendingScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const host = expoHost || '192.168.1.204';
  const baseUri = `http://${host}:3000/preview?view=lists`;
  const uri = searchQuery ? `${baseUri}&q=${encodeURIComponent(searchQuery)}` : baseUri;

  // ✅ FIXED: Proper navigation interception for /preview/app/ URLs
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;
    console.log('WebView attempting to load:', url); // Debug log
    
    // Check if it's an app detail link (matches /preview/app/app-15 pattern)
    if (url.includes('/preview/app/')) {
      const match = url.match(/\/preview\/app\/([^/?#]+)/);
      if (match) {
        const appId = match[1];
        console.log('Intercepting navigation to app:', appId); // Debug log
        
        // Navigate to native modal screen
        router.push(`/(modal)/${appId}`);
        
        // Return false to prevent WebView from loading this URL
        return false;
      }
    }
    
    // Allow all other URLs to load in WebView
    return true;
  };

  // ✅ ADD THIS: For Android, use onNavigationStateChange as backup
  const handleNavigationStateChange = (navState: any) => {
    if (Platform.OS === 'android') {
      const url = navState.url;
      console.log('Navigation state changed:', url);
      
      if (url.includes('/preview/app/')) {
        const match = url.match(/\/preview\/app\/([^/?#]+)/);
        if (match) {
          const appId = match[1];
          console.log('Intercepting via navigationStateChange:', appId);
          router.push(`/(modal)/${appId}`);
          // Note: Can't prevent navigation here, but router will open modal
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TextInput
          style={[
            styles.searchInput, 
            { 
              backgroundColor: colorScheme === 'dark' ? '#333' : '#f9f9f9', 
              color: colorScheme === 'dark' ? '#fff' : '#000' 
            }
          ]}
          placeholder="Search trending..."
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.profileContainer} onPress={() => router.push('/profile')}>
          <View style={[
            styles.profileAvatar, 
            { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }
          ]}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.webViewContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={uri}
            style={{ flex: 1, width: '100%', border: 'none' }}
            title="Trending Preview"
          />
        ) : (
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
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onNavigationStateChange={handleNavigationStateChange}
            // ✅ ADD: This ensures links open in the WebView context
            setSupportMultipleWindows={false}
          />
        )}
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