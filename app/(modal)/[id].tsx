import { useColorScheme } from '@/components/useColorScheme';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface App {
  name?: string;
  description?: string;
  icon?: string;
  launchUrl?: string;
  rating?: number;
  users?: number;
  screenshots?: string[];
}

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        tabBarStyle: { display: 'none' },
        headerShown: false
      });
      return () => {
        parent?.setOptions({
          tabBarStyle: { display: 'flex' },
          headerShown: true
        });
      };
    }, [navigation])
  );

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: app?.name || id,
    });
  }, [app, id, navigation]);

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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
        <Text style={[styles.loadingText, { color: colorScheme === 'dark' ? 'white' : 'black' }]}>
          Loading app details...
        </Text>
      </View>
    );
  }

  const title = app?.name || id;

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
      >
        {app?.icon && (
          <Image source={{ uri: app.icon }} style={styles.icon} resizeMode="contain" />
        )}

        <View style={styles.appInfoContainer}>
          <Text style={styles.appTitle}>{app?.name || id}</Text>
          {app?.rating && (
            <Text style={styles.rating}>
              {app.rating} • {app.users || '0'} users
            </Text>
          )}
        </View>

        {app?.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: colorScheme === 'dark' ? '#e5e5e5' : '#333' }]}>
              {app.description}
            </Text>
          </View>
        )}

        <View style={styles.screenshotsContainer}>
          <Text style={styles.sectionTitle}>Screenshots</Text>
          <View style={styles.activeScreenshot}>
            <Text style={styles.activeLabel}>Active screenshot</Text>
            {app?.screenshots && app.screenshots.length > 0 ? (
              <Image source={{ uri: app.screenshots[0] }} style={styles.screenshotImage} />
            ) : (
              <View style={styles.screenshotPlaceholder}>
                <Text style={styles.placeholderText}>No screenshot available</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 0, // ✅ Add safe area for iOS
    paddingBottom: 70,
  },
  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 16,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#000',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  screenshotsContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  activeScreenshot: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  screenshotImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  screenshotPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    justifyContent: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16, // ✅ Safe area for iOS home indicator
    zIndex: 1000,
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