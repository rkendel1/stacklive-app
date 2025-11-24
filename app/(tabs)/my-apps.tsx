import { View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

export default function MyAppsScreen() {
  const router = useRouter();
  const uri = 'http://127.0.0.1:32100/preview?view=my-apps';

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
          title="My Apps Preview"
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
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
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