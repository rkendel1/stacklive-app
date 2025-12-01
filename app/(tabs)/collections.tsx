import { useColorScheme } from '@/components/useColorScheme';
import { getIconComponent } from '@/constants/nativeIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollectionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const UserIcon = getIconComponent('user') || (() => <Text>👤</Text>);

  // Placeholder data for collections
  const collections: { id: string; name: string; icon: string; appCount: number; description: string }[] = [];

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
    createButton: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    createButtonText: {
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
    collectionCard: {
      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    collectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    collectionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    collectionIconText: {
      fontSize: 24,
    },
    collectionInfo: {
      flex: 1,
    },
    collectionName: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 2,
    },
    collectionCount: {
      fontSize: 13,
      color: isDark ? '#9ca3af' : '#6b7280',
    },
    collectionDescription: {
      fontSize: 14,
      color: isDark ? '#9ca3af' : '#6b7280',
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.userIconContainer} onPress={() => router.push('/profile')}>
          <UserIcon size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContent} contentContainerStyle={{ flexGrow: 1 }}>
        {collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No collections yet</Text>
            <Text style={styles.emptySubtitle}>
              Create collections to organize your favorite apps by category, mood, or purpose.
            </Text>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Collection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>My Collections</Text>
            {collections.map((collection) => (
              <TouchableOpacity key={collection.id} style={styles.collectionCard}>
                <View style={styles.collectionHeader}>
                  <View style={styles.collectionIcon}>
                    <Text style={styles.collectionIconText}>{collection.icon}</Text>
                  </View>
                  <View style={styles.collectionInfo}>
                    <Text style={styles.collectionName}>{collection.name}</Text>
                    <Text style={styles.collectionCount}>{collection.appCount} apps</Text>
                  </View>
                </View>
                <Text style={styles.collectionDescription}>{collection.description}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}