import { View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';


export default function CollectionsScreen() {
  const router = useRouter();
  const isIOS = Platform.OS === 'ios';
  const host = isIOS ? '192.168.1.204' : '127.0.0.1';
  const uri = `http://${host}:32100/preview?view=lists`;

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          src={uri}
          style={{ flex: 1, width: '100%', border: 'none' }}
          title="Collections Preview"
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