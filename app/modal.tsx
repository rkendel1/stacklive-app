import AppScreenshotsCarousel from '@/components/AppScreenshotsCarousel';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, Pressable, Share, StyleSheet, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

const { width: screenWidth } = Dimensions.get('window');

export default function ModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const host = expoHost || '192.168.1.204';

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showScreenshots, setShowScreenshots] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Mock apps data for /api/apps/[id] endpoint simulation
  const mockApps = {
    'test': {
      id: 'test',
      name: 'Test App',
      description: 'This is a mock app detail for testing the modal overlay. It demonstrates dynamic content rendering without replacing the tab below.',
      iconName: 'icon.png', // Assume local asset in assets/images/
      screenshots: [
        'https://example.com/screenshot1.png',
        'https://example.com/screenshot2.png',
        'https://example.com/screenshot3.png',
      ],
      tags: ['test', 'modal', 'overlay', 'preserve'],
      downloads: 12345,
      rating: 4.5,
      version: '1.0.0',
      website: 'https://example.com',
      launchUrl: `http://${host}:3000/preview/app/${id || 'test'}`,
    },
    // Add more mock apps as needed
  };

  useEffect(() => {
    const fetchAppDetails = async () => {
      try {
        setIsLoading(true);
        setError(undefined);
        // Simulate API call to /api/apps/[id]
        await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
        const appId = id || 'test';
        const appData = mockApps[appId as keyof typeof mockApps];
        if (!appData) {
          throw new Error('App not found');
        }
        setData(appData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load app details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAppDetails();
    }
  }, [id, host]);

  const handleInstall = async () => {
    if (!data) return;
    // TODO: Implement install logic (e.g., open store or download)
    Alert.alert('Install', `Installing ${data.name}...`);
    // Invalidate cache to refresh lists on return
    // Assuming RTK Query setup allows this; adjust as needed
    // api.util.invalidateTags(['App']);
    router.dismiss();
  };

  const handlePreview = () => {
    if (!data?.launchUrl) return;
    setShowPreview(true);
  };

  const handleShare = async () => {
    if (!data) return;
    try {
      const shareOptions = {
        message: `Check out ${data.name}: ${data.description}`,
        url: data.website || undefined,
        title: data.name,
      };
      await Share.share(shareOptions);
    } catch (err) {
      Alert.alert('Share Error', 'Unable to share app.');
    }
    router.dismiss();
  };

  const handleReport = () => {
    Alert.alert('Report', 'Reporting this app...');
    router.dismiss();
  };

  const closeModal = () => {
    router.dismiss();
  };

  const getIconSource = (iconName: string) => {
    switch (iconName) {
      case 'icon.png':
        return require('../assets/images/icon.png');
      default:
        return require('../assets/images/icon.png'); // Fallback
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? 'white' : 'blue'} />
        <Text style={styles.loadingText}>Loading app details...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <Text style={styles.errorText}>Failed to load app details.</Text>
        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <View style={styles.header}>
        <Pressable onPress={closeModal} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Ionicons name="close" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {data?.name || 'Loading...'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Icon Display */}
        {data?.iconName && (
          <View style={styles.iconContainer}>
            <Image
              source={getIconSource(data.iconName)}
              style={styles.appIcon}
            />
          </View>
        )}

        <Text style={styles.description} selectable>{data?.description}</Text>

        {data.screenshots && data.screenshots.length > 0 && (
          <TouchableOpacity
            style={styles.carouselTrigger}
            onPress={() => setShowScreenshots(true)}
          >
            <Text style={styles.carouselTriggerText}>View Screenshots ({data.screenshots.length})</Text>
          </TouchableOpacity>
        )}

        {showScreenshots && (
          <AppScreenshotsCarousel
            screenshots={data.screenshots}
            onClose={() => setShowScreenshots(false)}
          />
        )}

        <View style={styles.tagsContainer}>
          {data.tags?.map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Downloads</Text>
            <Text style={styles.statValue}>{data.downloads.toLocaleString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>{data.rating}/5</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Version</Text>
            <Text style={styles.statValue}>{data.version}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.installButton]} onPress={handleInstall}>
            <Ionicons name="download-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Install</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handlePreview}>
            <Ionicons name="eye-outline" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
            <Text style={styles.actionButtonText}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.reportButton]} onPress={handleReport}>
            <Ionicons name="flag-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Preview WebView */}
        {showPreview && data?.launchUrl && (
          <View style={styles.previewContainer}>
            <TouchableOpacity onPress={() => setShowPreview(false)} activeOpacity={1} style={styles.previewOverlay}>
              <View style={styles.previewCloseButton}>
                <Ionicons name="close" size={24} color="white" />
              </View>
            </TouchableOpacity>
            {Platform.OS === 'web' ? (
              <iframe
                src={data.launchUrl}
                style={styles.previewWebView}
                title={`App Preview ${data.name}`}
              />
            ) : (
              <WebView
                source={{ uri: data.launchUrl }}
                style={styles.previewWebView}
                originWhitelist={['*']}
                mixedContentMode="compatibility"
                javaScriptEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                startInLoadingState={true}
              />
            )}
          </View>
        )}
      </View>

      {showScreenshots && (
        <TouchableOpacity onPress={() => setShowScreenshots(false)} activeOpacity={1}>
          <View style={styles.carouselOverlay} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 8,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: 'white',
  },
  carouselTrigger: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  carouselTriggerText: {
    color: 'white',
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  installButton: {
    backgroundColor: 'blue',
  },
  reportButton: {
    backgroundColor: 'red',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    marginTop: 8,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  previewContainer: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  previewCloseButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 2,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  previewWebView: {
    flex: 1,
    width: '100%',
    borderWidth: 0,
  },
});