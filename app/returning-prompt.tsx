import SignUpModal from '@/components/SignUpModal';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

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

  // Record that we showed a prompt
  React.useEffect(() => {
    recordPromptShown();
  }, [recordPromptShown]);

  // Determine if we should show full-screen interstitial (after 2+ dismissals)
  const useFullScreenModal = promptCount >= 2;

  const handleAppleSignIn = useCallback(async () => {
    if (Platform.OS === 'ios') {
      try {
        await signIn('apple', 'User', undefined);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Apple Sign-In error:', error);
      }
    }
  }, [signIn, router]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signIn('google', 'User', undefined);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  }, [signIn, router]);

  const handleEmailSignIn = useCallback(async (email: string) => {
    try {
      await signIn('email', undefined, email);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Email Sign-In error:', error);
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
