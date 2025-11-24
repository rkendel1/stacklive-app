import { View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

export default function TabOneScreen() {
  const router = useRouter();
  const isIOS = Platform.OS === 'ios';
  const host = isIOS ? '192.168.1.204' : '127.0.0.1';
  const uri = `http://${host}:32100/preview`;

  const handleShouldStartLoadWithRequest = (request: any) => {
    if (request.url.includes('/app/')) {
      const match = request.url.match(/\/app\/([^/?#]+)/);
      if (match) {
        router.push(`/app/${match[1]}`);
        return false;
      }
    }
    return true;
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          src={uri}
          style={{ flex: 1, width: '100%', border: 'none' }}
          title="Home Preview"
        />
      ) : (
        <WebView
          source={{ uri }}
          style={{ flex: 1 }}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView failed to load:', nativeEvent);
          }}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          injectedJavaScript={`
            true; // Prevent injection errors
            function hideWebHeader() {
              // Target various possible header elements
              const selectors = [
                'h1',
                '.header',
                '#header',
                'nav',
                '[role="banner"]',
                '.navbar',
                'header'
              ];
              selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                  if (el.textContent && el.textContent.includes('Home') || el.querySelector('.user, [name="user"], .profile-icon')) {
                    el.style.display = 'none';
                  }
                });
              });
              // Also hide any top-level divs or sections that might be headers
              const topElements = document.body.children;
              for (let el of topElements) {
                if (el.tagName === 'DIV' && (el.classList.contains('header') || el.id === 'header' || el.textContent.includes('Home'))) {
                  el.style.display = 'none';
                }
              }
            }
            // Run on load
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', hideWebHeader);
            } else {
              hideWebHeader();
            }
            // Observe for dynamic changes
            const observer = new MutationObserver(hideWebHeader);
            observer.observe(document.body, { childList: true, subtree: true });
          `}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
