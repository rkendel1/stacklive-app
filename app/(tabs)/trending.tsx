import AppCard from '@/components/AppCard';
import { useColorScheme } from '@/components/useColorScheme';
import { getIconComponent } from '@/constants/nativeIcons';
import { useTrendingApps as useAppsData } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';
export default function TrendingScreen() {
  const { trendingApps, loading, error } = useAppsData();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = trendingApps.filter((app: MiniApp) => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
        <Text className="mt-2 dark:text-white">Loading trending apps...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 dark:text-red-400 text-center">{error}</Text>
      </View>
    );
  }

  if (filteredApps.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          {searchQuery ? 'No trending apps match your search' : 'No trending apps available'}
        </Text>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <View className="px-4 py-4 bg-white dark:bg-black">
      <Text className="text-xl font-bold dark:text-white mb-1">Trending Apps</Text>
      <Text className="text-gray-500 dark:text-gray-400 text-sm">{filteredApps.length} apps</Text>
    </View>
  );

  const renderAppItem = ({ item }: { item: MiniApp }) => (
    <View className="mx-4 my-2">
      <AppCard app={item} size="small" onPress={() => router.push(`/app-detail?id=${item.id}`)} />
    </View>
  );

  const SearchIcon = getIconComponent('search') || (() => <Text>🔍</Text>);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center mx-4 mt-4">
        <View className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full justify-center items-center mr-4">
          <SearchIcon size={20} color="#666" />
        </View>
        <TextInput
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm"
          placeholder="Search trending..."
          placeholderTextColor="gray"
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
        contentContainerStyle={{ paddingBottom: 20 }}
        className="p-2"
      />
    </View>
  );
}