import AppCard from '@/components/AppCard';
import { useColorScheme } from '@/components/useColorScheme';
import { getIconComponent } from '@/constants/nativeIcons';
import { useTrendingApps as useAppsData } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TrendingScreen() {
  const { trendingApps, loading, error } = useAppsData();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = colorScheme === 'dark';

  const filteredApps = trendingApps.filter((app: MiniApp) => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? '#4b5563' : '#d1d5db',
      borderRadius: 8,
      backgroundColor: isDark ? '#1f2937' : '#fff',
      color: isDark ? '#fff' : '#000',
    },
    listHeader: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
        <Text style={styles.loadingText}>Loading trending apps...</Text>
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

  if (filteredApps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery ? 'No trending apps match your search' : 'No trending apps available'}
        </Text>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <View style={styles.listHeader}>
      <Text style={styles.headerTitle}>Trending Apps</Text>
      <Text style={styles.headerSubtitle}>{filteredApps.length} apps</Text>
    </View>
  );

  const renderAppItem = ({ item }: { item: MiniApp }) => (
    <View style={styles.appItem}>
      <AppCard app={item} size="small" onPress={() => router.push(`/app-detail?id=${item.id}`)} />
    </View>
  );

  const UserIcon = getIconComponent('user') || (() => <Text>👤</Text>);

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.userIconContainer} onPress={() => router.push('/profile')}>
          <UserIcon size={20} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trending..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredApps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}