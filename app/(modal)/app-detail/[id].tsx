import AppScreenshotsCarousel from '@/components/AppScreenshotsCarousel';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getIconComponent } from '@/constants/nativeIcons';
import { useTrendingApps as useAppsData } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Color mapping for gradient backgrounds
const colorMap: Record<string, Record<number, string>> = {
  orange: { 400: '#fed7aa', 500: '#f97316', 600: '#ea580c' },
  blue: { 400: '#dbeafe', 500: '#3b82f6', 600: '#2563eb' },
  green: { 400: '#d1fae5', 500: '#10b981', 600: '#059669' },
  pink: { 400: '#fce7f3', 500: '#ec4899', 600: '#db2777' },
  purple: { 400: '#f3e8ff', 500: '#a855f7', 600: '#9333ea' },
  indigo: { 400: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5' },
};

// Default icon name constant
const DEFAULT_ICON = 'Box';

const getGradientColors = (miniApp?: MiniApp): readonly [string, string] => {
  if (miniApp?.primaryColor && miniApp.secondaryColor) {
    return [miniApp.primaryColor, miniApp.secondaryColor];
  }
  if (miniApp?.primaryColor) {
    return [miniApp.primaryColor, miniApp.primaryColor];
  }
  const iconBgColor = miniApp?.iconBackgroundColor;
  const cardBg = iconBgColor?.replace('bg-', '') || 'blue';
  const match = cardBg.match(/(\w+)-(\d+)/);
  const color = match ? match[1] : 'blue';
  return [colorMap[color]?.[400] || '#dbeafe', colorMap[color]?.[600] || '#2563eb'];
};

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { allApps } = useAppsData();
  const insets = useSafeAreaInsets();
  const { height } = Dimensions.get('window');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [iconError, setIconError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Swipe down to dismiss
  const translateY = useRef(new Animated.Value(0)).current;
  const SWIPE_THRESHOLD = height * 0.2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 15 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            router.back();
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    StatusBar.setHidden(false);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);


  const colors = Colors[colorScheme || 'light'];
  const isDark = colorScheme === 'dark';
  const backgroundColor = colors.background;

  // Get app data
  let app = allApps.find((a: MiniApp) => a.id === id) || null;


  const miniApp = app as MiniApp | undefined;

  // Ensure app properties are strings to prevent rendering errors
  const safeApp = {
    ...app,
    name: typeof app?.name === 'string' ? app.name : 'Unknown App',
    description: typeof app?.description === 'string' ? app.description : 'No description available',
    icon: typeof app?.icon === 'string' ? app.icon : DEFAULT_ICON,
  };

  const IconComponent = getIconComponent(app?.icon || DEFAULT_ICON);
  const gradientColors = getGradientColors(miniApp);

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const launchApp = () => {
    if (miniApp?.launchUrl) {
      const separator = miniApp.launchUrl.includes('?') ? '&' : '?';
      const webviewUrl = `${miniApp.launchUrl}${separator}webview=true`;
      router.push({
        pathname: '/(modal)/webview',
        params: { url: webviewUrl },
      });
    }
  };

  // Render loading/error state
  if (!id) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.text }]}>Invalid app ID</Text>
        </View>
      </View>
    );
  }

  if (!app) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.text }]}>App not found</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, { backgroundColor, transform: [{ translateY }] }]}
      {...panResponder.panHandlers}
    >
      {/* Minimal Header with Back and Favorite */}
      <View style={[styles.header, { paddingTop: insets.top || 0 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={26}
            color={isFavorite ? '#FFD700' : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || 0) + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Icon with Gradient Background */}
        <View style={styles.iconSection}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <View style={styles.iconContainer}>
              {miniApp?.iconUrl && !iconError ? (
                <ExpoImage
                  source={{ uri: miniApp.iconUrl }}
                  style={{ width: 56, height: 56, borderRadius: 12 }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  onError={() => setIconError(true)}
                />
              ) : (
                <IconComponent size={56} color="#fff" />
              )}
            </View>
          </LinearGradient>
        </View>

        {/* App Name */}
        <Text style={[styles.appName, { color: colors.text }]}>{safeApp.name}</Text>

        {/* Category */}
        <Text style={styles.category}>{miniApp?.categories?.[0] || 'App'}</Text>

        {/* Rating and Reviews */}
        {miniApp && (
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(miniApp.rating || 0) ? 'star' : 'star-outline'}
                  size={18}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: isDark ? '#999' : '#666' }]}>
              {`${(miniApp.rating ?? 0).toFixed(1)} · ${miniApp.reviews || 'No reviews yet'}`}
            </Text>
          </View>
        )}

        {/* Screenshots - positioned prominently after rating info */}
        {safeApp.screenshots && Array.isArray(safeApp.screenshots) && safeApp.screenshots.length > 0 ? (
          <View style={styles.screenshotsSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / (220 + 12));
                setCurrentScreenshotIndex(index);
              }}
              style={styles.screenshotsScroll}
              contentContainerStyle={styles.screenshotsContent}
              snapToInterval={232}
              snapToAlignment="start"
            >
              {safeApp.screenshots.filter((screenshot): screenshot is string => typeof screenshot === 'string').map((screenshot: string, index: number) => (
                <TouchableOpacity
                  key={`screenshot-${index}-${screenshot.slice(-20)}`}
                  onPress={() => { setSelectedIndex(index); setShowModal(true); }}
                  activeOpacity={0.8}
                  style={styles.screenshotWrapper}
                >
                  <ExpoImage
                    source={{ uri: screenshot }}
                    style={styles.screenshot}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Pagination Dots */}
            <View style={styles.dotsContainer}>
              {safeApp.screenshots.filter((screenshot): screenshot is string => typeof screenshot === 'string').map((_, index) => (
                <View
                  key={`dot-${index}`}
                  style={[
                    styles.dot,
                    { backgroundColor: index === currentScreenshotIndex ? '#007AFF' : 'rgba(0, 122, 255, 0.3)' }
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.screenshotsSection}>
            <Text style={[styles.placeholderText, { color: isDark ? '#999' : '#666', textAlign: 'center', marginVertical: 20 }]}>
              No screenshots available
            </Text>
          </View>
        )}

        {showModal && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
            <AppScreenshotsCarousel
              screenshots={(safeApp.screenshots || []).filter((screenshot): screenshot is string => typeof screenshot === 'string')}
              initialIndex={selectedIndex}
              onClose={() => setShowModal(false)}
            />
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.description, { color: isDark ? '#ccc' : '#555' }]}>
            {miniApp?.longDescription || safeApp.description || 'No description available'}
          </Text>
        </View>

        {/* Tags */}
        {miniApp?.tags && miniApp.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <View style={styles.tagsContainer}>
              {miniApp.tags.map((tag: string, index: number) => (
                <View key={index} style={[styles.tag, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Features */}
        {miniApp?.features && miniApp.features.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
            {miniApp.features.map((feature, index) => {
              const FeatureIcon = getIconComponent(feature.icon);
              return (
                <View key={index} style={[styles.featureItem, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
                  <View style={styles.featureIconContainer}>
                    <FeatureIcon size={20} color="#fff" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                    <Text style={[styles.featureDescription, { color: isDark ? '#999' : '#666' }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Reviews */}
        {miniApp?.ratingsAndReviews && miniApp.ratingsAndReviews.reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
            {miniApp.ratingsAndReviews.reviews.slice(0, 3).map((review, index) => (
              <View key={index} style={[styles.reviewItem, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewAvatar, { backgroundColor: isDark ? '#444' : '#e0e0e0' }]}>
                    <Text style={styles.reviewAvatarText}>👤</Text>
                  </View>
                  <Text style={[styles.reviewName, { color: colors.text }]}>{review.name}</Text>
                  <View style={styles.reviewStars}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons key={i} name={i < review.rating ? 'star' : 'star-outline'} size={12} color="#FFD700" />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewComment, { color: isDark ? '#aaa' : '#555' }]}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Launch App Button - Anchored to Bottom */}
      <View style={[styles.launchButtonContainer, { paddingBottom: (insets.bottom || 0) + 16, backgroundColor, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
        <TouchableOpacity style={styles.launchButton} activeOpacity={0.8} onPress={launchApp}>
          <Ionicons name="rocket" size={22} color="white" />
          <Text style={styles.launchButtonText}>Launch App</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  iconSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  screenshotsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  screenshotsScroll: {
    marginHorizontal: -20,
  },
  screenshotsContent: {
    paddingHorizontal: 20,
  },
  screenshotWrapper: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  screenshot: {
    width: 220,
    height: 400,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  reviewsSection: {
    marginBottom: 20,
  },
  reviewItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewAvatarText: {
    fontSize: 16,
  },
  reviewName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  launchButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  launchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  launchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});