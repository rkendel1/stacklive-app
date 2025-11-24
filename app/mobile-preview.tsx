import { useLocalSearchParams } from 'expo-router';
import WebView from 'react-native-webview';

export default function MobilePreview() {
  const params = useLocalSearchParams();
  const view = params.view as string || 'home';

  let uri;
  switch (view) {
    case 'trending':
      uri = 'http://192.168.1.204:3000/preview?view=trending';
      break;
    case 'lists':
      uri = 'http://192.168.1.204:3000/preview?view=lists';
      break;
    case 'my-apps':
      uri = 'http://192.168.1.204:3000/preview?view=my-apps';
      break;
    case 'home':
    default:
      uri = 'http://192.168.1.204:3000/preview';
      break;
  }

  return (
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
  );
}