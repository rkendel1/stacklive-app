// app/(tabs)/_layout.tsx
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideUI } from '../../contexts/HideUIContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { hideUI } = useHideUI();

  const activeColor = colorScheme === 'dark' ? 'white' : 'blue';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  const tabBarStyle = hideUI ? { display: 'none' as const } : {
    backgroundColor: '#f8f9fa',
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom,
  };

  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: activeColor,
          tabBarStyle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: ({ focused }: { focused: boolean }) => (
              <Text style={{ fontWeight: focused ? 'bold' : 'normal' }}>Home</Text>
            ),
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <FontAwesome name="home" size={24} color={focused ? activeColor : color} />
            ),
          }}
        />
        <Tabs.Screen
          name="trending"
          options={{
            title: 'Trending',
            tabBarLabel: ({ focused }: { focused: boolean }) => (
              <Text style={{ fontWeight: focused ? 'bold' : 'normal' }}>Trending</Text>
            ),
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <FontAwesome name="fire" size={24} color={focused ? activeColor : color} />
            ),
          }}
        />
        <Tabs.Screen
          name="my-apps"
          options={{
            title: 'My Apps',
            tabBarLabel: ({ focused }: { focused: boolean }) => (
              <Text style={{ fontWeight: focused ? 'bold' : 'normal' }}>My Apps</Text>
            ),
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <FontAwesome name="briefcase" size={24} color={focused ? activeColor : color} />
            ),
          }}
        />
        <Tabs.Screen
          name="collections"
          options={{
            title: 'Collections',
            tabBarLabel: ({ focused }: { focused: boolean }) => (
              <Text style={{ fontWeight: focused ? 'bold' : 'normal' }}>Collections</Text>
            ),
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <FontAwesome name="folder-o" size={24} color={focused ? activeColor : color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}