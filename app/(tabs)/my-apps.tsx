import { useColorScheme } from '@/components/useColorScheme';
import { getIconComponent } from '@/constants/nativeIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyAppsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const UserIcon = getIconComponent('user') || (() => <Text>👤</Text>);

  // Placeholder data for saved/installed apps
  const savedApps: { id: string; name: string; icon: string; lastUsed: string }[] = [];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? '#000' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1f2937' : '#e5e7eb',
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
      backgroundColor: isDark ? '#374151' : '#d1d5db',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: isDark ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    exploreButton: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    exploreButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 16,
    },
    appItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
      borderRadius: 12,
      marginBottom: 12,
    },
    appIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    appIconText: {
      fontSize: 24,
    },
    appInfo: {
      flex: 1,
    },
    appName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 2,
    },
    appLastUsed: {
      fontSize: 13,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search my apps..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.userIconContainer} onPress={() => router.push('/profile')}>
          <UserIcon size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContent} contentContainerStyle={{ flexGrow: 1 }}>
        {savedApps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>No apps yet</Text>
            <Text style={styles.emptySubtitle}>
              Apps you save or use frequently will appear here for quick access.
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/trending')}
            >
              <Text style={styles.exploreButtonText}>Explore Apps</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Recently Used</Text>
            {savedApps.map((app) => (
              <TouchableOpacity 
                key={app.id} 
                style={styles.appItem}
                onPress={() => router.push(`/(modal)/app-detail/${app.id}`)}
              >
                <View style={styles.appIcon}>
                  <Text style={styles.appIconText}>{app.icon}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appLastUsed}>{app.lastUsed}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}