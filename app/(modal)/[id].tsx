import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

interface App {
  name?: string;
  description?: string;
  icon?: string;
  launchUrl?: string;
}

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const host = expoHost || '192.168.1.204';
  const previewUri = `http://${host}:3000/preview/app/${id}`;

  useEffect(() => {
    const fetchAppDetails = async () => {
      try {
        const response = await fetch(`http://${host}:3000/api/apps/${id}`);
        if (response.ok) {
          const appData = await response.json();
          setApp(appData);
        } else {
          console.warn(`Failed to fetch app ${id}: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching app details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppDetails();
    }
  }, [id, host]);

  const handleLaunch = () => {
    if (app?.launchUrl) {
      Linking.openURL(app.launchUrl).catch(err => Alert.alert('Launch Error', err.message));
    } else {
      Alert.alert('Launch App', `Launching app ${id} (launch URL not available)`);
    }
  };

  // ✅ UPDATED: Use router.dismiss() for modal or router.back() as fallback
  const handleBack = () => {
    if (router.canDismiss()) {
      router.dismiss();
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.homeButton}>
            <FontAwesome
              name="arrow-left"
              size={24}
              color={colorScheme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
            Loading...
          </Text>
        </View>
        <Text style={[styles.loadingText, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
          Loading app details...
        </Text>
      </View>
    );
  }

  const title = app?.name || id;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]} 
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.header, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f8f9fa' }]}>
        <TouchableOpacity onPress={handleBack} style={styles.homeButton}>
          <FontAwesome
            name="arrow-left"
            size={24}
            color={colorScheme === 'dark' ? 'white' : 'black'}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {app?.icon && (
        <Image source={{ uri: app.icon }} style={styles.icon} resizeMode="contain" />
      )}

      {app?.description && (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: colorScheme === 'dark' ? '#e5e5e5' : '#333' }]}>
            {app.description}
          </Text>
        </View>
      )}

      <View style={styles.previewContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={previewUri}
            style={styles.webview}
            title={`App Preview ${title}`}
          />
        ) : (
          <WebView
            source={{ uri: previewUri }}
            style={styles.webview}
            originWhitelist={['*']}
            mixedContentMode="compatibility"
            javaScriptEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState={true}
            // ✅ ADD: Prevent nested navigation within the preview WebView
            onShouldStartLoadWithRequest={(request) => {
              const url = request.url;
              // Allow the initial preview URL and same-origin requests
              if (url.startsWith(previewUri) || url === previewUri) {
                return true;
              }
              // Block nested app detail links to prevent modal stacking from See All
              if (url.includes('/preview/app/') && url !== previewUri) {
                console.log('Blocking nested app detail:', url);
                return false;
              }
              // For external links, open in browser
              if (url.startsWith('http')) {
                Linking.openURL(url);
                return false;
              }
              // Allow other internal links (e.g., reviews) to load in WebView
              return true;
            }}
          />
        )}
      </View>

      <View style={[
        styles.buttonContainer, 
        { 
          backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : 'white',
          borderTopColor: colorScheme === 'dark' ? '#38383a' : '#E5E5EA'
        }
      ]}>
        <TouchableOpacity style={styles.launchButton} onPress={handleLaunch}>
          <Text style={styles.launchButtonText}>Launch App</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 0, // ✅ Add safe area for iOS
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  homeButton: {
    paddingRight: 16,
  },
  headerSpacer: {
    width: 40, // Balance the layout
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 16,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  previewContainer: {
    flex: 1,
    marginVertical: 16,
    minHeight: 400, // ✅ Ensure WebView has minimum height
  },
  webview: {
    flex: 1,
    width: '100%',
    borderWidth: 0,
  },
  buttonContainer: {
    height: 70,
    justifyContent: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16, // ✅ Safe area for iOS home indicator
  },
  launchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  launchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});