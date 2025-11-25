import Constants from 'expo-constants';

/**
 * Server host configuration derived from Expo constants.
 * Uses hostUri from expoConfig if available, otherwise falls back to a local network IP.
 * This allows dynamic host detection in development.
 */
const hostUri = Constants.expoConfig?.hostUri;
const expoHost = hostUri ? hostUri.split(':')[0] : undefined;
export const HOST = '51013c60a56a.ngrok-free.app'; // Ngrok tunnel for device access

/**
 * Server port for the preview and app endpoints.
 * Fixed at 32100 for consistency in development.
 */
export const PORT = 32100;
/**
 * Base path for all preview endpoints.
 * Appended to host:port to form preview URIs.
 */
export const PREVIEW_PATH = '/preview';

/**
 * Base URI for preview endpoints, using the dynamic HOST and fixed PORT.
 * Used for external or network access to the preview server (e.g., in web or remote debugging).
 */
export const BASE_URI = `https://${HOST}${PREVIEW_PATH}`; // HTTPS via ngrok, no port

/**
 * Localhost host for webview contexts in mobile apps.
 * Uses 127.0.0.1 to access the local development server from within the app.
 */
const LOCAL_HOST = '127.0.0.1';

/**
 * URI for webview previews, using localhost to ensure accessibility from mobile webviews.
 * Mirrors BASE_URI structure but with local host for React Native webview compatibility.
 * Reduces redundancy by reusing PORT and PREVIEW_PATH.
 */
export const WEBVIEW_URI = `https://${HOST}${PREVIEW_PATH}`; // HTTPS via ngrok for device

/**
 * Enum for supported page types in the app previews.
 * Defines the different views that can be previewed (home, trending, etc.).
 */
export type PageType = 'home' | 'trending' | 'my-apps' | 'collections' | 'profile';

/**
 * Configuration interface for each page type.
 * Centralizes settings like search query params, UI placeholders, and component requirements.
 * Enables a configuration-driven approach for generating page URIs and UI elements.
 */
export interface PageConfig {
  query: string;
  placeholder: string;
  title: string;
  hasSearch: boolean;
  hasAvatar: boolean;
  isModal: boolean;
  components: string[];
}

/**
 * Centralized configuration object for page types.
 * Maps each PageType to its specific config, including query params for URI building,
 * UI placeholders/titles, and flags for features like search or avatars.
 * This drives dynamic URI generation and UI rendering without hardcoding.
 */
export const pageConfigs: Record<PageType, PageConfig> = {
  home: {
    query: 'view=home',
    placeholder: 'Search home...',
    title: 'Home Preview',
    hasSearch: true,
    hasAvatar: true,
    isModal: false,
    components: ['search', 'avatar']
  },
  trending: {
    query: 'view=trending',
    placeholder: 'Search trending...',
    title: 'Trending Preview',
    hasSearch: true,
    hasAvatar: true,
    isModal: false,
    components: ['search', 'avatar']
  },
  'my-apps': {
    query: 'view=my-apps',
    placeholder: 'Search my apps...',
    title: 'My Apps Preview',
    hasSearch: true,
    hasAvatar: true,
    isModal: false,
    components: ['search', 'avatar']
  },
  collections: {
    query: 'view=lists',
    placeholder: 'Search collections...',
    title: 'Collections Preview',
    hasSearch: true,
    hasAvatar: true,
    isModal: false,
    components: ['search', 'avatar']
  },
  profile: {
    query: 'view=profile',
    placeholder: '',
    title: 'Profile Preview',
    hasSearch: false,
    hasAvatar: false,
    isModal: false,
    components: []
  }
};

/**
 * Interface for app data used in native detail rendering.
 */
export interface AppData {
  name: string;
  description: string;
  icon: any; // Image source
  screenshots: string[]; // Image paths
}

/**
 * Mock app data map by ID for native UI rendering.
 * In production, fetch from API or backend.
 */
export const APP_DATA: Record<string, AppData> = {
  '1': {
    name: 'Sample App',
    description: 'This is a sample app description for demonstration purposes. It showcases various features like previews and details.',
    icon: require('../assets/images/icon.png'), // Use existing asset
    screenshots: [
      require('../assets/images/splash-icon.png'),
      require('../assets/images/icon.png')
    ]
  }
  // Add more entries as needed
};

/**
 * Generates a URI for a specific page type using BASE_URI.
 * Appends page-specific query from config, optional search query, and theme.
 * Used for external preview links.
 * @param pageType - The type of page to generate URI for.
 * @param searchQuery - Optional search term to encode in query.
 * @param theme - Optional light/dark theme param.
 * @returns Full URI string.
 */
export function getPageUri(pageType: PageType, searchQuery?: string, theme?: 'light' | 'dark'): string {
  const config = pageConfigs[pageType];
  let base = BASE_URI;
  if (config.query) {
    base += `?${config.query}`;
  }
  if (theme) {
    base += `&theme=${theme}`;
  }
  if (searchQuery) {
    base += `&q=${encodeURIComponent(searchQuery)}`;
  }
  return base;
}

/**
 * Generates a URI for webview context using WEBVIEW_URI (localhost).
 * Similar to getPageUri but for mobile webview access.
 * @param pageType - The type of page to generate URI for.
 * @param searchQuery - Optional search term to encode in query.
 * @param theme - Optional light/dark theme param.
 * @returns Full URI string for webview.
 */
export function getWebViewUri(pageType: PageType, searchQuery?: string, theme?: 'light' | 'dark'): string {
  const config = pageConfigs[pageType];
  let base = WEBVIEW_URI;
  if (config.query) {
    base += `?${config.query}`;
  }
  if (theme) {
    base += `&theme=${theme}`;
  }
  if (searchQuery) {
    base += `&q=${encodeURIComponent(searchQuery)}`;
  }
  return base;
}

/**
 * Generates URI for the profile view using BASE_URI.
 * @returns Profile preview URI.
 */
export function getProfileUri(): string {
  return `${BASE_URI}?view=profile`;
}

/**
 * Base URI for app endpoints, excluding preview path.
 * Used for app-specific routes like /app/{id}.
 */
export const APP_BASE = `https://${HOST}`; // HTTPS via ngrok, no port

/**
 * Generates URI for a specific app by ID using APP_BASE.
 * @param id - The app ID.
 * @returns App URI string.
 */
export function getAppUri(id: string): string {
  return `${APP_BASE}/app/${id}`;
}

/**
 * Generates preview URI for an app detail by ID using BASE_URI.
 * @param id - The app ID.
 * @returns App detail preview URI.
 */
export function getAppDetailUri(id: string): string {
  return `${BASE_URI}/app/${id}`;
}

/**
 * Generates webview URI for an app detail by ID using WEBVIEW_URI.
 * Supports optional theme param.
 * @param id - The app ID.
 * @param theme - Optional light/dark theme.
 * @returns Webview app detail URI.
 */
export function getWebViewAppDetailUri(id: string, theme?: 'light' | 'dark'): string {
  let base = `${WEBVIEW_URI}/app/${id}`;
  if (theme) {
    base += `?theme=${theme}`;
  }
  return base;
}

/**
 * Shared injected JavaScript for WebView to style body and remove margins/padding.
 */
export const INJECTED_JAVASCRIPT = `
  (function() {
    // Hide any web header/footer if they exist
    const style = document.createElement('style');
    style.textContent = \`
      body { 
        margin: 0; 
        padding: 0;
        height: 100vh;
        overflow-y: auto;
      }
    \`;
    document.head.appendChild(style);
  })();
  true;
`;

/**
 * Common props shared across WebView instances.
 * Excludes platform-specific or dynamic props.
 */
export const WEBVIEW_COMMON_PROPS = {
  originWhitelist: ['*'],
  mixedContentMode: 'compatibility' as const,
  javaScriptEnabled: true,
  allowsInlineMediaPlayback: true,
  mediaPlaybackRequiresUserAction: false,
  startInLoadingState: true,
  scalesPageToFit: false,
  setSupportMultipleWindows: false,
  pullToRefreshEnabled: false
};

/**
 * Shared style objects for WebView container and view.
 * To be used with StyleSheet.create in components.
 */
export const SHARED_WEBVIEW_STYLES = {
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  }
};

/**
 * Factory function to create WebView event handlers.
 * @param router - Expo router instance for navigation.
 * @returns Handlers object with onShouldStartLoadWithRequest and onMessage.
 */
export function createWebViewHandlers(router: any) {
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;
    console.log('App detail WebView navigation:', url);
    // Allow all navigation for now
    return true;
  };

  const onMessage = (event: any) => {
    const data = event.nativeEvent.data;
    console.log('Message from WebView:', data);
    if (data === 'close') {
      router.back();
    }
  };

  return { onShouldStartLoadWithRequest: handleShouldStartLoadWithRequest, onMessage };
}

