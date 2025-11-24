import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import WebView from 'react-native-webview';

export default function AppDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;

  const expoHost = process.env.EXPO_PUBLIC_HOST || '192.168.1.204';
  const uri = `http://${expoHost}:3000/app/${id}`;

  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
}