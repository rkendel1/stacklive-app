import AppCard from '@/components/AppCard';
import SignUpModal from '@/components/SignUpModal';
import { useColorScheme } from '@/components/useColorScheme';
import { pageConfigs } from '@/constants/config';
import { getIconComponent } from '@/constants/nativeIcons';
import { useTrendingApps as useAppsData } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { allApps, curation, loading, error } = useAppsData();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const getHydratedApps = (ids: string[]): MiniApp[] => {
    if (!allApps || !ids.length) return [];
    const allAppsMap = allApps.reduce((map, app) => {
      map[app.id] = app;
      return map;
    }, {} as { [key: string]: MiniApp });
    return ids.map(id => allAppsMap[id]).filter(Boolean);
  };

  const homeConfig = pageConfigs.home;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
        <Text className="mt-2 dark:text-white">Loading home...</Text>
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

  const filteredApps = allApps.filter((app: MiniApp) => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSection = (title: string, apps: MiniApp[]) => {
    const isFeatured = title === 'Featured';
    const isNewThisWeek = title === 'New This Week';

    const renderItem = ({ item }: { item: MiniApp }) => (
      <View className={isFeatured ? "w-full" : "w-1/2 p-2"}>
        <AppCard app={item} size={isFeatured ? "large" : "small"} onPress={() => router.push(`/app-detail?id=${item.id}`)} />
      </View>
    );

    const ItemSeparatorComponent = undefined;

    const screenWidth = Dimensions.get('window').width;

    return (
      <View className="mx-4 my-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <View className="flex-row justify-between items-center mb-2 px-4 pt-4">
          <Text className="text-lg font-semibold dark:text-white">{title}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/trending')}>
            <Text className="text-blue-500 dark:text-blue-400">See all</Text>
          </TouchableOpacity>
        </View>
        {apps.length === 0 ? (
          <Text className="text-gray-500 dark:text-gray-400 text-center py-4">No {title.toLowerCase()} apps available</Text>
        ) : isFeatured ? (
          <View className="px-4 pb-4">
            <AppCard app={apps[0]} size="large" onPress={() => router.push(`/app-detail?id=${apps[0].id}`)} />
          </View>
        ) : (
          <FlatList
            data={apps.slice(0, 4)}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal={false}
            numColumns={2}
            ItemSeparatorComponent={ItemSeparatorComponent}
            showsHorizontalScrollIndicator={false}
            className="p-4 pb-4"
            contentContainerStyle={{ columnGap: 16, rowGap: 12, paddingHorizontal: 16 }}
          />
        )}
      </View>
    );
  };

  if (searchQuery) {
    const UserIcon = getIconComponent('user') || (() => <Text>👤</Text>);
    return (
      <View className="flex-1 bg-white dark:bg-black">
        <View className="flex-row items-center p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
          <TextInput
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white mr-4 shadow-sm"
            placeholder={homeConfig.placeholder}
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="w-10 h-10 bg-gray-300 rounded-full justify-center items-center">
            <UserIcon size={20} color="#666" />
          </View>
        </View>
        <FlatList
          data={filteredApps}
          renderItem={({ item }) => <AppCard app={item} size="small" onPress={() => router.push(`/app-detail?id=${item.id}`)} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          className="p-2"
          ListEmptyComponent={
            <Text className="text-gray-500 dark:text-gray-400 text-center py-4">No apps match your search</Text>
          }
        />
      </View>
    );
  }
  const UserIcon = getIconComponent('user') || (() => <Text>👤</Text>);
  const ArrowIcon = getIconComponent('arrow-right') || (() => <Text className="text-white">→</Text>);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
        <TextInput
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white mr-4 shadow-sm"
          placeholder={homeConfig.placeholder}
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View className="w-10 h-10 bg-gray-300 rounded-full justify-center items-center">
          <UserIcon size={20} color="#666" />
        </View>
      </View>
      <View className="flex-1 pt-1">
        {renderSection('Featured', getHydratedApps(curation?.featuredAppIds || []))}
        {renderSection('New This Week', getHydratedApps(curation?.newThisWeekAppIds || []))}
      </View>
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700">
        <TouchableOpacity className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 rounded-lg flex-row justify-center items-center" onPress={() => setShowModal(true)}>
          <Text className="text-white font-semibold text-sm mr-2">Complete your account to save</Text>
          <Text className="text-white font-medium text-sm mr-1">Sign up +</Text>
          <ArrowIcon size={16} color="white" />
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