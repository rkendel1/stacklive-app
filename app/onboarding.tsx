import OnboardingCarousel from '@/components/OnboardingCarousel';
import SignUpModal from '@/components/SignUpModal';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { AuthUser, signInWithApple, signInWithEmail, signInWithGoogle } from '@/src/lib/auth';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const {
    completeOnboarding,
    signIn,
    continueAsGuest,
    promptCount,
  } = useOnboarding();
  
  const [showCarousel, setShowCarousel] = useState(true);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Determine if we should show full-screen interstitial (after 2+ dismissals)
  const useFullScreenModal = promptCount >= 2;

  const handleCarouselComplete = useCallback(async () => {
    await completeOnboarding();
    setShowCarousel(false);
    setShowSignUpModal(true);
  }, [completeOnboarding]);

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
        setShowSignUpModal(false);
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
        setShowSignUpModal(false);
        router.replace('/(tabs)');
      } else if (result.error) {
        Alert.alert('Sign-In Failed', result.error);
      }
    } catch (error) {
      console.error('Email Sign-In error:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign-in.');
    }
  }, [signIn, router]);

  const handleNativeSignup = useCallback(async (user: AuthUser) => {
    await signIn(
      'email-password',
      undefined,
      user.email || undefined,
      user.id,
      user.token || undefined
    );
    setShowSignUpModal(false);
    router.replace('/(tabs)');
  }, [signIn, router]);

  const handleNativeLogin = useCallback(async (user: AuthUser) => {
    await signIn(
      'email-password',
      undefined,
      user.email || undefined,
      user.id,
      user.token || undefined
    );
    setShowSignUpModal(false);
    router.replace('/(tabs)');
  }, [signIn, router]);

  const handleContinueAsGuest = useCallback(async () => {
    await continueAsGuest();
    setShowSignUpModal(false);
    router.replace('/(tabs)');
  }, [continueAsGuest, router]);

  const getSignUpTitle = () => {
    if (useFullScreenModal) {
      return 'Unlock your experience';
    }
    return 'Create your account';
  };

  const getSignUpSubtitle = () => {
    if (useFullScreenModal) {
      return 'Sign up to unlock unlimited likes, save your drafts, and get personalized recommendations.';
    }
    return 'Sign up to save your favorites and get personalized recommendations.';
  };

  const getIncentive = () => {
    if (useFullScreenModal) {
      return '🔓 Unlock unlimited features';
    }
    return '👥 Join 50M+ users';
  };

  if (showCarousel) {
    return <OnboardingCarousel onComplete={handleCarouselComplete} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <SignUpModal
        visible={showSignUpModal}
        onDismiss={handleContinueAsGuest}
        onAppleSignIn={handleAppleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onContinueAsGuest={handleContinueAsGuest}
        onNativeSignup={handleNativeSignup}
        onNativeLogin={handleNativeLogin}
        title={getSignUpTitle()}
        subtitle={getSignUpSubtitle()}
        incentive={getIncentive()}
        fullScreen={useFullScreenModal}
      />
    </View>
  );
}
