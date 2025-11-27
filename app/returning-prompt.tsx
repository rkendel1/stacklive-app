import SignUpModal from '@/components/SignUpModal';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { signInWithApple, signInWithEmail, signInWithGoogle } from '@/src/lib/auth';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

/**
 * Screen shown to returning users (sessions 2-4) who haven't created an account.
 * Shows a half-sheet sign-up modal with contextual copy encouraging sign-up.
 */
export default function ReturningPromptScreen() {
  const router = useRouter();
  const {
    signIn,
    continueAsGuest,
    recordPromptShown,
    sessionCount,
    promptCount,
  } = useOnboarding();

  // Record that we showed a prompt - only once on mount
  const hasRecordedPrompt = useRef(false);
  React.useEffect(() => {
    if (!hasRecordedPrompt.current) {
      hasRecordedPrompt.current = true;
      recordPromptShown();
    }
  }, []);

  // Determine if we should show full-screen interstitial (after 2+ dismissals)
  const useFullScreenModal = promptCount >= 2;

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
        router.replace('/(tabs)');
      } else if (result.error && result.error !== 'Sign-in was cancelled') {
        Alert.alert('Sign-In Failed', result.error);
      }
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign-in.');
    }
  }, [signIn, router]);

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
        router.replace('/(tabs)');
      } else if (result.error && result.error !== 'Sign-in was cancelled') {
        Alert.alert('Sign-In Failed', result.error);
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign-in.');
    }
  }, [signIn, router]);

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
        router.replace('/(tabs)');
      } else if (result.error) {
        Alert.alert('Sign-In Failed', result.error);
      }
    } catch (error) {
      console.error('Email Sign-In error:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign-in.');
    }
  }, [signIn, router]);

  const handleContinueAsGuest = useCallback(async () => {
    await continueAsGuest();
    router.replace('/(tabs)');
  }, [continueAsGuest, router]);

  const getTitle = () => {
    if (useFullScreenModal) {
      return 'Unlock your experience';
    }
    if (sessionCount === 2) {
      return 'Welcome back!';
    }
    if (sessionCount === 3) {
      return 'Pick up where you left off';
    }
    return 'Create an account to save your progress';
  };

  const getSubtitle = () => {
    if (useFullScreenModal) {
      return 'Sign up to unlock unlimited likes, save your drafts, and get personalized recommendations.';
    }
    if (sessionCount === 2) {
      return 'Create an account to save your favorites and get personalized recommendations.';
    }
    if (sessionCount === 3) {
      return 'Sign up to never lose your progress and unlock all features.';
    }
    return 'Join our community to get the most out of StackLive.';
  };

  const getIncentive = () => {
    if (useFullScreenModal) {
      return '🔓 Unlock unlimited features';
    }
    if (sessionCount === 2) {
      return '👥 Join 50M+ users';
    }
    return '💾 Save your progress';
  };

  return (
    <View style={styles.container}>
      <SignUpModal
        visible={true}
        onDismiss={handleContinueAsGuest}
        onAppleSignIn={handleAppleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onContinueAsGuest={handleContinueAsGuest}
        title={getTitle()}
        subtitle={getSubtitle()}
        incentive={getIncentive()}
        fullScreen={useFullScreenModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
