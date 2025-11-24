// app/app-detail.tsx - WebView version (consistent with your tab screens)

import { useColorScheme } from '@/components/useColorScheme';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const host = expoHost || '192.168.1.204';
  const uri = `http://${host}:3000/preview/app/${id}`;

  // Inject JavaScript to hide any elements you want (if needed)
  const injectedJavaScript = `
    (function() {
      // Hide any web header/footer if they exist
      const style = document.createElement('style');
      style.textContent = \`
        body { 
          margin: 0; 
          padding: 0;
          height: 100vh;
          overflow-y: auto;
        }
      \`;
      document.head.appendChild(style);
    })();
    true;
  `;

  // Handle navigation events (like Launch App button)
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;
    console.log('App detail WebView navigation:', url);
    
    // If Launch App button redirects somewhere, handle it here
    // For now, allow all navigation within the WebView
    return true;
  };

  const backgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor }]} 
      edges={['top', 'bottom']}
    >
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
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          bounces={Platform.OS === 'ios'}
          scrollEnabled={true}
          scalesPageToFit={false}
          injectedJavaScript={injectedJavaScript}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          setSupportMultipleWindows={false}
          // Enable pull-to-refresh if you want
          pullToRefreshEnabled={false}
          // Handle messages from WebView if needed
          onMessage={(event) => {
            const data = event.nativeEvent.data;
            console.log('Message from WebView:', data);
            
            // Example: Handle close button from web
            if (data === 'close') {
              router.back();
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});