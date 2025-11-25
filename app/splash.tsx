import { splashConfig } from '@/constants/config';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Image, View } from 'react-native';
import { WebView } from 'react-native-webview';

let iconUri: string | undefined;
if (splashConfig.hasImages) {
  iconUri = Image.resolveAssetSource(require('../assets/images/icon.png')).uri;
}

const splashHTML = `
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
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      overflow: hidden; 
    }
    img { 
      max-width: 200px; 
      max-height: 200px; 
      opacity: 0; 
      animation: fadeIn ${splashConfig.animationDuration}ms ease-in forwards; 
    }
    @keyframes fadeIn { 
      to { opacity: 1; } 
    }
  </style>
  <script src="http://127.0.0.1:32100/embed.js" data-token="a9e921fd-81ec-4338-9898-92418893e7ff" data-host="http://127.0.0.1:32100" defer></script>
</head>
<body>
  ${splashConfig.hasImages ? `<img src="${iconUri}" alt="Splash Logo">` : ''}
</body>
</html>
`;

export default function Splash() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, splashConfig.duration); // Auto-navigate after config duration

    return () => clearTimeout(timer);
  }, [router]);

  const handleLoad = () => {
    SplashScreen.hideAsync();
    // Optional: Clear timeout if needed, but keep simple
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ html: splashHTML }}
        style={{ flex: 1 }}
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