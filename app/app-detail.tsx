import AppScreenshotsCarousel from '@/components/AppScreenshotsCarousel';
import { useColorScheme } from '@/components/useColorScheme';
import { getIconComponent } from '@/constants/nativeIcons';
import { useTrendingApps } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AppDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allApps, loading, error } = useTrendingApps();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const app = allApps.find((a: MiniApp) => a.id === id);


  useEffect(() => {
    if (!app && !loading && !error) {
      router.back();
    }
  }, [app, loading, error]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    header: {
      padding: 16,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 8,
    },
    description: {
      fontSize: 16,
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: 16,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#f3f4f6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    section: {
      padding: 16,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 12,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureIcon: {
      width: 24,
      height: 24,
      marginRight: 12,
    },
    featureText: {
      flex: 1,
      color: isDark ? '#fff' : '#000',
    },
    rating: {
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
      marginBottom: 8,
    },
    launchButton: {
      backgroundColor: '#007AFF',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      margin: 16,
    },
    launchText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#000' : '#fff',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDark ? '#000' : '#fff',
    },
  });

  if (loading || !app) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
        <Link href="/" asChild>
          <TouchableOpacity>
            <Text>Go Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  const IconComponent = getIconComponent(app.icon) || (() => <Text>📱</Text>);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconComponent size={32} color="#007AFF" />
        </View>
        <Text style={styles.name}>{app.name}</Text>
        <Text style={styles.description}>{app.description}</Text>
        {app.rating && (
          <Text style={styles.rating}>
            ★ {app.rating.toFixed(1)} ({app.reviews})
          </Text>
        )}
      </View>

      {app.screenshots && app.screenshots.length > 0 && (
        <View style={styles.section}>
          <AppScreenshotsCarousel screenshots={app.screenshots} onClose={() => {}} />
        </View>
      )}

      {app.longDescription && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{app.longDescription}</Text>
        </View>
      )}

      {app.features && app.features.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          {app.features.map((feature, index) => {
            const FeatureIcon = getIconComponent(feature.icon) || (() => <Text>⭐</Text>);
            return (
              <View key={index} style={styles.feature}>
                <View style={styles.featureIcon}>
                  <FeatureIcon size={24} color="#007AFF" />
                </View>
                <View style={styles.featureText}>
                  <Text style={{ fontWeight: '600', color: isDark ? '#fff' : '#000' }}>{feature.title}</Text>
                  <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>{feature.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {app.ratingsAndReviews && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
          <Text style={styles.rating}>{app.ratingsAndReviews.averageRating} ({app.ratingsAndReviews.totalReviews})</Text>
          {app.ratingsAndReviews.reviews.slice(0, 3).map((review, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600', color: isDark ? '#fff' : '#000', marginRight: 8 }}>{review.name}</Text>
                <Text>★ {review.rating}</Text>
              </View>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>{review.comment}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.launchButton}
        onPress={() => {
          if (!app.launchUrl) return;
          router.push(`/(modal)/webview?url=${encodeURIComponent(app.launchUrl)}`);
        }}
      >
        <Text style={styles.launchText}>Launch App</Text>
      </TouchableOpacity>
      </ScrollView>
      
    </View>
  );
}