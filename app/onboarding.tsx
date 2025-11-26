import OnboardingCarousel from '@/components/OnboardingCarousel';
import SignUpModal from '@/components/SignUpModal';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, View } from 'react-native';

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
    // TODO: Implement real Apple Sign-In using expo-apple-authentication
    // For now, simulate sign-in for demo purposes
    if (Platform.OS === 'ios') {
      try {
        await signIn('apple', 'User', undefined);
        setShowSignUpModal(false);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Apple Sign-In error:', error);
      }
    }
  }, [signIn, router]);

  const handleGoogleSignIn = useCallback(async () => {
    // TODO: Implement real Google Sign-In
    // For now, simulate sign-in for demo purposes
    try {
      await signIn('google', 'User', undefined);
      setShowSignUpModal(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Google Sign-In error:', error);
    }
  }, [signIn, router]);

  const handleEmailSignIn = useCallback(async (email: string) => {
    // TODO: Implement real email sign-in with magic link/OTP
    // For now, simulate sign-in for demo purposes
    try {
      await signIn('email', undefined, email);
      setShowSignUpModal(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Email Sign-In error:', error);
    }
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
        title={getSignUpTitle()}
        subtitle={getSignUpSubtitle()}
        incentive={getIncentive()}
        fullScreen={useFullScreenModal}
      />
    </View>
  );
}
