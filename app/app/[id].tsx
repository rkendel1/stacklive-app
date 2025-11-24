import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Alert, Button, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const host = expoHost || '192.168.1.204';
  const uri = `http://${host}:3000/preview/app/${id}`;

  const handleLaunch = () => {
    Alert.alert('Launch App', `Launching app ${id}`);
    // TODO: Implement actual launch logic, e.g., Linking.openURL(appUrl)
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('../index')} style={styles.homeButton}>
          <FontAwesome
            name="home"
            size={24}
            color={colorScheme === 'dark' ? 'white' : 'black'}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
          {id}
        </Text>
      </View>
      {Platform.OS === 'web' ? (
        <iframe
          src={uri}
          style={styles.webview}
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
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  homeButton: {
    paddingRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    width: '100%',
    borderWidth: 0,
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