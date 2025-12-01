import AppCard from '@/components/AppCard';
import { useColorScheme } from '@/components/useColorScheme';
import { getIconComponent } from '@/constants/nativeIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrendingApps as useAppsData } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TrendingScreen() {
  const { trendingApps, featuredApps, newApps, allApps, loading, error } = useAppsData();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = colorScheme === 'dark';

  const filterApps = (apps: MiniApp[]) => apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = [
    { title: 'This Week', data: filterApps(featuredApps) },
    { title: 'New This Week', data: filterApps(newApps) },
    { title: 'Trending', data: filterApps(trendingApps.length > 0 ? trendingApps : allApps) }
  ].filter(section => section.data.length > 0);

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
    sectionHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginTop: 16,
      marginBottom: 8,
      paddingHorizontal: 16,
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    emptyText: {
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 16,
    },
    userIconContainer: {
      width: 40,
      height: 40,
      backgroundColor: isDark ? '#374151' : '#d1d5db',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
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
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    appItem: {
      marginBottom: 12,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient colors={isDark ? ['#000', '#111'] : ['#00ff9f', '#00b140']} style={{ flex: 1 }}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
            <Text style={styles.loadingText}>Loading trending apps...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient colors={isDark ? ['#000', '#111'] : ['#00ff9f', '#00b140']} style={{ flex: 1 }}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (sections.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient colors={isDark ? ['#000', '#111'] : ['#00ff9f', '#00b140']} style={{ flex: 1 }}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No apps match your search' : 'No apps available'}
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const renderAppItem = ({ item }: { item: MiniApp }) => (
    <View style={styles.appItem}>
      <AppCard app={item} size="compact" onPress={() => router.push(`/app-detail/${item.id}`)} />
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const UserIcon = getIconComponent('user') || (() => <Text>👤</Text>);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={isDark ? ['#000', '#111'] : ['#00ff9f', '#00b140']} style={{ flex: 1 }}>
        <View style={styles.searchHeader}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search trending..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.userIconContainer} onPress={() => router.push('/profile')}>
            <UserIcon size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <SectionList
          sections={sections}
          renderItem={renderAppItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}