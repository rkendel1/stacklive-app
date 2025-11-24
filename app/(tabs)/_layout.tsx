import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colorScheme === 'dark' ? 'white' : 'blue',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          title: 'Trending',
          tabBarIcon: ({ color }) => <FontAwesome name="fire" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-apps"
        options={{
          title: 'My Apps',
          tabBarIcon: ({ color }) => <FontAwesome name="briefcase" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color }) => <FontAwesome name="folder-o" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}