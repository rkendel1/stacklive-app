import { splashConfig } from '@/constants/config';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

let iconUri: string | undefined;
if (splashConfig.hasImages) {
  if (Platform.OS === 'web') {
    iconUri = '/assets/images/icon.png';
  } else {
    iconUri = Image.resolveAssetSource(require('../assets/images/icon.png')).uri;
  }
}

// First-time splash HTML (beautiful brand visual + tagline)
const firstTimeSplashHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background-color: ${splashConfig.backgroundColor}; 
      display: flex; 
      flex-direction: column;
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      overflow: hidden; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    img { 
      max-width: 200px; 
      max-height: 200px; 
      opacity: 0; 
      animation: fadeIn ${splashConfig.animationDuration}ms ease-in forwards; 
    }
    .tagline {
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      margin-top: 24px;
      opacity: 0;
      animation: fadeIn ${splashConfig.animationDuration}ms ease-in 500ms forwards;
    }
    @keyframes fadeIn { 
      to { opacity: 1; } 
    }
  </style>
</head>
<body>
  ${splashConfig.hasImages ? `<img src="${iconUri}" alt="Splash Logo">` : ''}
  <div class="tagline">One-tap apps that already know you.</div>
</body>
</html>
`;

// Returning user splash HTML (shorter, different creative)
const returningSplashHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background-color: ${splashConfig.backgroundColor}; 
      display: flex; 
      flex-direction: column;
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      overflow: hidden; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    img { 
      max-width: 150px; 
      max-height: 150px; 
      opacity: 0; 
      animation: fadeIn 300ms ease-in forwards; 
    }
    .welcome {
      color: rgba(255, 255, 255, 0.9);
      font-size: 18px;
      font-weight: 600;
      margin-top: 20px;
      opacity: 0;
      animation: fadeIn 300ms ease-in 200ms forwards;
    }
    @keyframes fadeIn { 
      to { opacity: 1; } 
    }
  </style>
</head>
<body>
  ${splashConfig.hasImages ? `<img src="${iconUri}" alt="Splash Logo">` : ''}
  <div class="welcome">Welcome back!</div>
</body>
</html>
`;

export default function Splash() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const {
    isFirstLaunch,
    hasCompletedOnboarding,
    hasAccount,
    sessionCount,
    isLoading,
    initSession,
  } = useOnboarding();
  
  const [initialized, setInitialized] = useState(false);

  // Initialize session count on mount
  useEffect(() => {
    if (!isLoading && !initialized) {
      initSession().then(() => setInitialized(true));
    }
  }, [isLoading, initialized, initSession]);

  useEffect(() => {
    if (isLoading || !initialized) return;

    // Determine splash duration based on user type
    // First launch: 1.5-2 seconds, returning: 1 second
    const duration = isFirstLaunch 
      ? Math.min(splashConfig.duration, 2000) 
      : 1000;

    const timer = setTimeout(() => {
      // Navigation logic based on user state
      if (isFirstLaunch || !hasCompletedOnboarding) {
        // First launch: go to onboarding carousel
        router.replace('/onboarding');
      } else if (!hasAccount && sessionCount <= 4) {
        // Sessions 2-4 without account: show sign-up prompt
        router.replace('/returning-prompt');
      } else {
        // Has account or sessions 5+: go straight to feed
        router.replace('/(tabs)');
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [router, isFirstLaunch, hasCompletedOnboarding, hasAccount, sessionCount, isLoading, initialized]);

  const handleLoad = () => {
    SplashScreen.hideAsync();
  };

  // Show loading state while onboarding context initializes
  if (isLoading || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Choose splash HTML based on user type
  const splashHTML = isFirstLaunch ? firstTimeSplashHTML : returningSplashHTML;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: splashHTML }}
        style={styles.webView}
        onLoad={handleLoad}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
  },
  webView: {
    flex: 1,
  },
});