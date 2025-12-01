import { Tabs } from 'expo-router';
import { Grid, Home, Layers, TrendingUp } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // hide any built-in header
        tabBarStyle: {
          height: 60,
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="trending"
        options={{ tabBarIcon: ({ color }) => <TrendingUp color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="my-apps"
        options={{ tabBarIcon: ({ color }) => <Grid color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="collections"
        options={{ tabBarIcon: ({ color }) => <Layers color={color} size={24} /> }}
      />
    </Tabs>
  );
}
