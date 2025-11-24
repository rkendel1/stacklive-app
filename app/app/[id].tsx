import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Button, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const uri = `http://127.0.0.1:32100/preview/app/${id}`;

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.push('/mobile-preview')}
          style={{ marginLeft: 10 }}
        >
          <FontAwesome
            name="home"
            size={24}
            color={colorScheme === 'dark' ? 'white' : 'black'}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, colorScheme]);

  const handleLaunch = () => {
    Alert.alert('Launch App', `Launching app ${id}`);
    // TODO: Implement actual launch logic, e.g., Linking.openURL(appUrl)
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          src={uri}
          style={{ flex: 1, width: '100%', border: 'none' }}
          title={`App Detail ${id}`}
        />
      ) : (
        <WebView
          source={{ uri }}
          style={styles.webview}
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState={true}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Launch App" onPress={handleLaunch} color="#007AFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 16,
  },
});