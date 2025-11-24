import { View } from '@/components/Themed';
import { Platform, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

export default function CollectionsScreen() {
  const uri = 'http://127.0.0.1:32100/preview?view=lists';

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