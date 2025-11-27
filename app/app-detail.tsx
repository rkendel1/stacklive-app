import AppScreenshotsCarousel from '@/components/AppScreenshotsCarousel';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { APP_DATA, APP_DETAIL_CONFIG, AppData, SHARED_WEBVIEW_STYLES, WEBVIEW_COMMON_PROPS, getWebViewAppDetailUri } from '@/constants/config';
import { getIconComponent } from '@/constants/nativeIcons';
import { useTrendingApps as useAppsData } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Linking, PanResponder, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useHideUI } from '../contexts/HideUIContext';

export default function AppDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { allApps } = useAppsData();
  const { setHideUI, setHideSearchBar } = useHideUI();
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const [isFavorite, setIsFavorite] = useState(false);

  // Swipe back animation
  const DISMISS_THRESHOLD_RATIO = 0.25;
  const translateY = useRef(new Animated.Value(0)).current;
  const SWIPE_THRESHOLD = height * DISMISS_THRESHOLD_RATIO;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
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
    setHideUI(APP_DETAIL_CONFIG.hideTabs);
    setHideSearchBar(APP_DETAIL_CONFIG.hideSearch);
    StatusBar.setHidden(true);
    return () => {
      setHideUI(false);
      setHideSearchBar(false);
      StatusBar.setHidden(false);
    };
  }, [setHideUI, setHideSearchBar]);

  if (!id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Invalid app ID</Text>
      </View>
    );
  }

  const appData = APP_DATA[id as string];
  const app = allApps.find((a: MiniApp) => a.id === id) || appData;

  const isMiniApp = (obj: MiniApp | AppData | undefined): obj is MiniApp => Boolean(obj && 'category' in obj);
  const miniApp = isMiniApp(app) ? app : undefined;

  const IconComponent = getIconComponent(app?.icon || 'default');
  const colors = Colors[colorScheme || 'light'];
  const backgroundColor = colors.background;
  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const launchApp = () => {
    if (miniApp?.launchUrl) {
      Linking.openURL(miniApp.launchUrl);
    }
  };

  const styles = StyleSheet.create({
    ...SHARED_WEBVIEW_STYLES,
    fullScreenOverlay: {
      flex: 1,
      backgroundColor,
    },
    safeArea: {
      flex: 1,
      backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee',
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    starButton: {
      padding: 8,
    },
    contentContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    contentWrapper: {
      flex: 1,
      position: 'relative',
    },
    scrollView: {
      flex: 1,
    },
    previewContainer: {
      height: 400,
      backgroundColor: colors.background,
    },
    appInfo: {
      padding: 16,
      backgroundColor: colors.background,
    },
    appHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    appIcon: {
      width: 80,
      height: 80,
      borderRadius: 16,
      backgroundColor: miniApp?.iconBackgroundColor || (colorScheme === 'dark' ? '#333' : '#f0f0f0'),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    appDetails: {
      flex: 1,
    },
    appName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    appCategory: {
      fontSize: 16,
      color: '#007AFF',
      marginBottom: 8,
    },
    appStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    ratingText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 4,
    },
    userCount: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#999' : '#666',
    },
    description: {
      padding: 16,
      fontSize: 16,
      lineHeight: 24,
      color: colorScheme === 'dark' ? colors.text : '#666',
    },
    tagsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    tag: {
      backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
    },
    tagText: {
      fontSize: 14,
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
    },
    screenshots: {
      padding: 16,
    },
    featuresList: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee',
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    featureDetails: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    featureDesc: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#999' : '#666',
    },
    reviewsSection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    reviewsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    averageRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    averageStars: {
      flexDirection: 'row',
      marginRight: 8,
    },
    averageText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    totalReviews: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#999' : '#666',
    },
    reviewItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee',
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
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    reviewName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    reviewStars: {
      flexDirection: 'row',
    },
    reviewComment: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#999' : '#666',
    },
    launchButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingBottom: insets.bottom + 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#333' : '#eee',
    },
    launchButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    launchButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  if (!app) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Detail</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: colors.text }}>App not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Animated.View style={[styles.fullScreenOverlay, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{app?.name || 'App Detail'}</Text>
          <TouchableOpacity style={styles.starButton} onPress={toggleFavorite}>
            <Ionicons name={isFavorite ? "star" : "star-outline"} size={24} color={isFavorite ? "#FFD700" : colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentWrapper}>
          {/* Preview */}
          <View style={styles.previewContainer}>
            <WebView
              source={{ uri: getWebViewAppDetailUri(id, colorScheme ?? 'light') }}
              style={styles.webView}
              {...WEBVIEW_COMMON_PROPS}
            />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* App Info Section */}
            <View style={styles.appInfo}>
              <View style={styles.appHeader}>
                <View style={styles.appIcon}>
                  <IconComponent size={48} color="#fff" />
                </View>
                <View style={styles.appDetails}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appCategory}>{miniApp?.category || 'Uncategorized'}</Text>
                  <View style={styles.appStats}>
                    <View style={styles.rating}>
                      <View style={styles.averageStars}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons key={i} name={i < Math.floor(miniApp?.rating || 0) ? "star" : "star-outline"} size={16} color="#FFD700" />
                        ))}
                      </View>
                      <Text style={styles.ratingText}>{miniApp?.rating}</Text>
                    </View>
                    <Text style={styles.userCount}>{miniApp?.reviews || '0'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              {miniApp?.longDescription || app.description}
            </Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {miniApp?.tags?.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Features */}
            {miniApp?.features && miniApp.features.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Features</Text>
                <FlatList
                  data={miniApp.features}
                  renderItem={({ item }: { item: { icon: string; title: string; description: string } }) => {
                    const FeatureIcon = getIconComponent(item.icon) || (() => <Ionicons name="star" size={24} color="#fff" />);
                    return (
                      <View style={styles.featureItem}>
                        <View style={styles.featureIcon}>
                          <FeatureIcon size={24} color="#fff" />
                        </View>
                        <View style={styles.featureDetails}>
                          <Text style={styles.featureTitle}>{item.title}</Text>
                          <Text style={styles.featureDesc}>{item.description}</Text>
                        </View>
                      </View>
                    );
                  }}
                  keyExtractor={(item, index) => index.toString()}
                  style={styles.featuresList}
                />
              </>
            )}

            {/* Ratings & Reviews */}
            {miniApp?.ratingsAndReviews && miniApp.ratingsAndReviews.reviews.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
                {(() => {
                  const { averageRating, totalReviews, reviews } = miniApp!.ratingsAndReviews;
                  return (
                    <View style={styles.reviewsSection}>
                      <View style={styles.reviewsHeader}>
                        <View style={styles.averageRating}>
                          <View style={styles.averageStars}>
                            {[...Array(5)].map((_, i) => (
                              <Ionicons key={i} name={i < Math.floor(averageRating) ? "star" : "star-outline"} size={16} color="#FFD700" />
                            ))}
                          </View>
                          <Text style={styles.averageText}>{averageRating}</Text>
                        </View>
                        <Text style={styles.totalReviews}>{totalReviews}</Text>
                      </View>
                      <FlatList
                        data={reviews.slice(0, 3)}
                        renderItem={({ item }: { item: { avatar: string; name: string; rating: number; comment: string } }) => (
                          <View style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                              <View style={styles.reviewAvatar}>
                                <Text style={{ fontSize: 14 }}>👤</Text>
                              </View>
                              <Text style={styles.reviewName}>{item.name}</Text>
                              <View style={styles.reviewStars}>
                                {[...Array(5)].map((_, i) => (
                                  <Ionicons key={i} name={i < item.rating ? "star" : "star-outline"} size={12} color="#FFD700" />
                                ))}
                              </View>
                            </View>
                            <Text style={styles.reviewComment}>{item.comment}</Text>
                          </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    </View>
                  );
                })()}
              </>
            )}

            {/* Screenshots Section */}
            <Text style={styles.sectionTitle}>Screenshots</Text>
            {app.screenshots && app.screenshots.length > 0 && (
              <View style={styles.screenshots}>
                <AppScreenshotsCarousel screenshots={app.screenshots} onClose={() => {}} />
              </View>
            )}
          </ScrollView>

          {/* Launch App Button */}
          <View style={styles.launchButtonContainer}>
            <TouchableOpacity style={styles.launchButton} activeOpacity={0.8} onPress={launchApp}>
              <Ionicons name="flash" size={24} color="white" />
              <Text style={styles.launchButtonText}>Launch App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}