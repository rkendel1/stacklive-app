import AppCard from '@/components/AppCard';
import SignUpModal from '@/components/SignUpModal';
import { useColorScheme } from '@/components/useColorScheme';
import { pageConfigs } from '@/constants/config';
import { getIconComponent } from '@/constants/nativeIcons';
import { useTrendingApps as useAppsData } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { allApps, curation, loading, error } = useAppsData();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  const getHydratedApps = (ids: string[]): MiniApp[] => {
    if (!allApps || !ids.length) return [];
    const allAppsMap = allApps.reduce((map, app) => {
      map[app.id] = app;
      return map;
    }, {} as { [key: string]: MiniApp });
    return ids.map(id => allAppsMap[id]).filter(Boolean);
  };

  const homeConfig = pageConfigs.home;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#000' : '#fff',
    },
    loadingText: {
      marginTop: 8,
      color: isDark ? '#fff' : '#000',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    errorText: {
      color: isDark ? '#f87171' : '#ef4444',
      textAlign: 'center',
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDark ? '#000' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#e5e7eb',
    },
    searchInput: {
      flex: 1,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#d1d5db',
      borderRadius: 8,
      backgroundColor: isDark ? '#1f2937' : '#fff',
      color: isDark ? '#fff' : '#000',
      marginRight: 16,
    },
    userIconContainer: {
      width: 40,
      height: 40,
      backgroundColor: '#d1d5db',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      flex: 1,
      paddingTop: 4,
      paddingBottom: 100,
    },
    sectionCard: {
      marginHorizontal: 16,
      marginVertical: 12,
      backgroundColor: isDark ? '#111827' : '#fff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#1f2937' : '#f3f4f6',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    seeAllText: {
      color: '#3b82f6',
      fontSize: 14,
    },
    sectionContent: {
      padding: 16,
    },
    emptyText: {
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      paddingVertical: 16,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    gridItem: {
      width: (screenWidth - 64) / 2,
      marginBottom: 12,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: isDark ? '#000' : '#fff',
      borderTopWidth: 1,
      borderTopColor: isDark ? '#374151' : '#e5e7eb',
    },
    signUpButton: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signUpText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
      marginRight: 8,
    },
    searchResultsContainer: {
      flex: 1,
      padding: 16,
    },
    searchResultItem: {
      marginBottom: 12,
    },
    // Featured carousel styles
    featuredCarouselContainer: {
      marginVertical: 12,
    },
    featuredSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    featuredSectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#fff' : '#000',
    },
    carouselContainer: {
      paddingLeft: 16,
    },
    carouselItem: {
      width: screenWidth - 48,
      marginRight: 12,
    },
    carouselPagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    paginationDotActive: {
      backgroundColor: '#3b82f6',
    },
    paginationDotInactive: {
      backgroundColor: isDark ? '#4b5563' : '#d1d5db',
    },
    // Compact apps section styles
    compactSectionContainer: {
      marginHorizontal: 16,
      marginVertical: 12,
    },
    compactSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    compactSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    compactAppItem: {
      marginBottom: 0,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text style={styles.loadingText}>Loading home...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const filteredApps = allApps.filter((app: MiniApp) => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get featured and other apps
  const featuredApps = getHydratedApps(curation?.featuredAppIds || []);
  const newThisWeekApps = getHydratedApps(curation?.newThisWeekAppIds || []);

  // Handle carousel scroll to update pagination
  const onCarouselScroll = (event: any) => {
    const slideWidth = screenWidth - 48;
    const offset = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offset / slideWidth);
    if (newIndex !== activeCarouselIndex && newIndex >= 0 && newIndex < featuredApps.length) {
      setActiveCarouselIndex(newIndex);
    }
  };

  // Render featured apps carousel
  const renderFeaturedCarousel = () => {
    if (featuredApps.length === 0) {
      return (
        <View style={styles.featuredCarouselContainer}>
          <View style={styles.featuredSectionHeader}>
            <Text style={styles.featuredSectionTitle}>Featured</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/trending')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.emptyText}>No featured apps available</Text>
        </View>
      );
    }

    return (
      <View style={styles.featuredCarouselContainer}>
        <View style={styles.featuredSectionHeader}>
          <Text style={styles.featuredSectionTitle}>Featured</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/trending')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={carouselRef}
          data={featuredApps}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onCarouselScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={screenWidth - 48 + 12}
          snapToAlignment="start"
          contentContainerStyle={styles.carouselContainer}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <AppCard app={item} size="large" onPress={() => router.push(`/app-detail?id=${item.id}`)} />
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
        {featuredApps.length > 1 && (
          <View style={styles.carouselPagination}>
            {featuredApps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeCarouselIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render compact section for non-featured apps
  const renderCompactSection = (title: string, apps: MiniApp[]) => {
    if (apps.length === 0) {
      return (
        <View style={styles.compactSectionContainer} key={title}>
          <View style={styles.compactSectionHeader}>
            <Text style={styles.compactSectionTitle}>{title}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/trending')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.emptyText}>No {title.toLowerCase()} apps available</Text>
        </View>
      );
    }

    return (
      <View style={styles.compactSectionContainer} key={title}>
        <View style={styles.compactSectionHeader}>
          <Text style={styles.compactSectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/trending')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        {apps.map((item) => (
          <View key={item.id} style={styles.compactAppItem}>
            <AppCard app={item} size="compact" onPress={() => router.push(`/app-detail?id=${item.id}`)} />
          </View>
        ))}
      </View>
    );
  };

  const UserIcon = getIconComponent('user') || (() => <Text>👤</Text>);
  const ArrowIcon = getIconComponent('arrow-right') || (() => <Text style={{ color: '#fff' }}>→</Text>);

  if (searchQuery) {
    return (
      <View style={styles.container}>
        <View style={styles.searchHeader}>
          <TextInput
            style={styles.searchInput}
            placeholder={homeConfig.placeholder}
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.userIconContainer} onPress={() => router.push('/profile')}>
            <UserIcon size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.searchResultsContainer}>
          {filteredApps.length === 0 ? (
            <Text style={styles.emptyText}>No apps match your search</Text>
          ) : (
            filteredApps.map((item) => (
              <View key={item.id} style={styles.searchResultItem}>
                <AppCard app={item} size="compact" onPress={() => router.push(`/app-detail?id=${item.id}`)} />
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder={homeConfig.placeholder}
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.userIconContainer} onPress={() => router.push('/profile')}>
          <UserIcon size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderFeaturedCarousel()}
        {renderCompactSection('New This Week', newThisWeekApps)}
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <LinearGradient
            colors={['#3b82f6', '#4f46e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signUpButton}
          >
            <Text style={styles.signUpText}>Complete your account to save</Text>
            <Text style={styles.signUpText}>Sign up +</Text>
            <ArrowIcon size={16} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <SignUpModal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        onAppleSignIn={() => setShowModal(false)}
        onGoogleSignIn={() => setShowModal(false)}
        onEmailSignIn={(email) => setShowModal(false)}
        onContinueAsGuest={() => setShowModal(false)}
        title="Complete your account"
        subtitle="to save apps"
        incentive="Sign up +"
      />
    </View>
  );
}