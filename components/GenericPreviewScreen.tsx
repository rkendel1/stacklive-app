import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { APP_DETAIL_CONFIG, getWebViewUri, pageConfigs, type PageConfig, type PageType } from '@/constants/config';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';
import { useHideUI } from '../contexts/HideUIContext';

interface Props {
  pageType: PageType;
  hideHeader?: boolean;
  externalSearchQuery?: string;
}

export default function GenericPreviewScreen({ pageType, hideHeader, externalSearchQuery }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const config: PageConfig = pageConfigs[pageType];
  
  const { hideUI, hideSearchBar, setHideUI, setHideSearchBar } = useHideUI();

  const uri = getWebViewUri(pageType, externalSearchQuery ?? searchQuery, colorScheme ? colorScheme as 'light' | 'dark' : undefined);

  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;
    console.log('WebView attempting to load:', url);
    
    // Check if it's an app detail link
    if (url.includes('/preview/app/')) {
      const match = url.match(/\/preview\/app\/([^/?#]+)/);
      if (match) {
        const appId = match[1];
        console.log('Intercepting navigation to app:', appId);
        
        if (APP_DETAIL_CONFIG.hideSearch) setHideSearchBar(true);
        if (APP_DETAIL_CONFIG.hideTabs) setHideUI(true);
        
        // Use push to show the full-screen modal overlay
        router.push({
          pathname: '/app-detail',
          params: { id: appId }
        });
        
        return false;
      }
    }
    
    return true;
  };

  const handleNavigationStateChange = (navState: any) => {
    if (Platform.OS === 'android') {
      const url = navState.url;
      console.log('Navigation state changed:', url);
      
      if (url.includes('/preview/app/')) {
        const match = url.match(/\/preview\/app\/([^/?#]+)/);
        if (match) {
          const appId = match[1];
          console.log('Intercepting via navigationStateChange:', appId);
          
          if (APP_DETAIL_CONFIG.hideSearch) setHideSearchBar(true);
          if (APP_DETAIL_CONFIG.hideTabs) setHideUI(true);
          
          // Use push to show the full-screen modal overlay
          router.push({
            pathname: '/app-detail',
            params: { id: appId }
          });
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {!hideUI && !hideHeader && (
        <View style={styles.headerContainer}>
          {config.hasSearch && !hideSearchBar && (
            <TextInput
              style={[
                styles.searchInput, 
                { 
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f9f9f9', 
                  color: colorScheme === 'dark' ? '#fff' : '#000' 
                }
              ]}
              placeholder={config.placeholder}
              placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          )}
          {config.hasAvatar && (
            <TouchableOpacity style={styles.profileContainer} onPress={() => router.push('/profile')}>
              <View style={[
                styles.profileAvatar, 
                { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }
              ]}>
                <Text style={styles.avatarText}>U</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.webViewContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={uri}
            style={{ flex: 1, width: '100%', border: 'none' }}
            title={config.title}
          />
        ) : (
            <WebView
              source={{ uri }}
              style={styles.webView}
              originWhitelist={['*']}
              mixedContentMode="compatibility"
              javaScriptEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              startInLoadingState={true}
              bounces={Platform.OS === 'ios'}
              scrollEnabled={true}
              scalesPageToFit={false}
              injectedJavaScript={`(function() {
                ${colorScheme === 'dark' ? "document.documentElement.classList.add('dark'); document.body.classList.add('dark');" : ''}
                document.documentElement.style.height = '100vh';
                document.body.style.height = '100vh';
                document.body.style.overflowY = 'scroll';
              })(); true;`}
              onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
              onNavigationStateChange={handleNavigationStateChange}
              setSupportMultipleWindows={false}
            />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  profileContainer: {
    marginLeft: 'auto',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});