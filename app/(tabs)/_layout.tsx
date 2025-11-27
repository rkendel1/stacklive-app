// app/(tabs)/_layout.tsx
import AccountBanner from '@/components/AccountBanner';
import SignUpModal from '@/components/SignUpModal';
import { useColorScheme } from '@/components/useColorScheme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { signInWithApple, signInWithEmail, signInWithGoogle } from '@/src/lib/auth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideUI } from '../../contexts/HideUIContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { hideUI } = useHideUI();
  const { 
    hasAccount, 
    hasCompletedOnboarding,
    promptCount,
    signIn, 
    continueAsGuest,
    recordPromptShown,
  } = useOnboarding();

  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const activeColor = colorScheme === 'dark' ? 'white' : 'blue';

  // Show banner for guest users who have completed onboarding but haven't signed up
  const showAccountBanner = hasCompletedOnboarding && !hasAccount && !hideUI;
  
  // Use full-screen modal after 2+ dismissals
  const useFullScreenModal = promptCount >= 2;

  const handleBannerPress = useCallback(() => {
    recordPromptShown();
    setShowSignUpModal(true);
  }, [recordPromptShown]);

  const handleAppleSignIn = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS devices.');
      return;
    }
    
    try {
      const result = await signInWithApple();
      if (result.success && result.user) {
        await signIn(
          'apple',
          result.user.displayName || undefined,
          result.user.email || undefined,
          result.user.id,
          result.user.token
        );
        setShowSignUpModal(false);
      } else if (result.error && result.error !== 'Sign-in was cancelled') {
        Alert.alert('Sign-In Failed', result.error);
      }
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign-in.');
    }
  }, [signIn]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        await signIn(
          'google',
          result.user.displayName || undefined,
          result.user.email || undefined,
          result.user.id,
          result.user.token
        );
        setShowSignUpModal(false);
      } else if (result.error && result.error !== 'Sign-in was cancelled') {
        Alert.alert('Sign-In Failed', result.error);
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign-in.');
    }
  }, [signIn]);

  const handleEmailSignIn = useCallback(async (email: string) => {
    try {
      const result = await signInWithEmail(email);
      if (result.success && result.user) {
        await signIn(
          'email',
          result.user.displayName || undefined,
          result.user.email || undefined,
          result.user.id,
          result.user.token
        );
        setShowSignUpModal(false);
      } else if (result.error) {
        Alert.alert('Sign-In Failed', result.error);
      }
    } catch (error) {
      console.error('Email Sign-In error:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign-in.');
    }
  }, [signIn]);

  const handleContinueAsGuest = useCallback(async () => {
    await continueAsGuest();
    setShowSignUpModal(false);
  }, [continueAsGuest]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  const tabBarStyle = hideUI ? { display: 'none' as const } : {
    backgroundColor: '#f8f9fa',
    height: 60,
    paddingBottom: insets.bottom,
  };

  return (
    <View style={styles.container}>
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

      {/* Account Banner for guest users */}
      <AccountBanner
        visible={showAccountBanner}
        onPress={handleBannerPress}
      />

      {/* Sign-Up Modal */}
      <SignUpModal
        visible={showSignUpModal}
        onDismiss={() => setShowSignUpModal(false)}
        onAppleSignIn={handleAppleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onContinueAsGuest={handleContinueAsGuest}
        title={useFullScreenModal ? 'Unlock your experience' : 'Complete your account'}
        subtitle={
          useFullScreenModal 
            ? 'Sign up to unlock unlimited likes, save your drafts, and get personalized recommendations.'
            : 'Sign up to save your favorites and get personalized recommendations.'
        }
        incentive={useFullScreenModal ? '🔓 Unlock unlimited features' : '👥 Join 50M+ users'}
        fullScreen={useFullScreenModal}
      />
    </View>
  );
}