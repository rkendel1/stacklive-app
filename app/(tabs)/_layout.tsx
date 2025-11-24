import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const activeColor = colorScheme === 'dark' ? 'white' : 'blue';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          // @ts-ignore
          tabBarIndicatorStyle: {
            backgroundColor: activeColor,
            height: 3,
          },
          tabBarStyle: {
            paddingBottom: insets.bottom,
          },
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
    </SafeAreaView>
  );
}