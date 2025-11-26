import { useColorScheme } from '@/components/useColorScheme';
import { getIconComponent } from '@/constants/nativeIcons';
import { useTrendingApps as useAppsData } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Text, TextInput, TouchableOpacity, View } from 'react-native';
export default function TrendingScreen() {
  const { trendingApps, loading, error } = useAppsData();
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = trendingApps.filter((app: MiniApp) => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
        <Text className="mt-2">Loading trending apps...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
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

  const renderAppItem = ({ item }: { item: MiniApp }) => {
    const IconComponent = getIconComponent(item.icon);
    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700"
        onPress={() => item.launchUrl && Linking.openURL(item.launchUrl)}
      >
        <View className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 justify-center items-center mr-4 ${item.iconBackgroundColor || 'bg-blue-500'}`}>
          <IconComponent size={24} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-lg dark:text-white">{item.name}</Text>
          <Text className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-yellow-500 font-medium">{item.rating || 0} ★</Text>
            <Text className="text-gray-500 ml-2">{item.reviews}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <TextInput
        className="mx-4 mt-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
        placeholder="Search trending..."
        placeholderTextColor="gray"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredApps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        className="p-2"
      />
    </View>
  );
}