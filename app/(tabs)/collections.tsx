import { useColorScheme } from '@/components/useColorScheme';
import { getIconComponent } from '@/constants/nativeIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CollectionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const UserIcon = getIconComponent('user') || (() => <Text>👤</Text>);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
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
  });

  return (
    <View style={styles.container}>
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
    </View>
  );
}