/**
 * Dynamically determine the base URL for the app.
 * This allows the native app to connect to either a local development server
 * or a live production server without code changes.
 */
const DEV_HOST = 'localhost';
const DEV_PORT = 32100;

// The `EXPO_PUBLIC_` prefix is required by Expo to expose the variable to your app's code.
// In production, you will set this environment variable.
// In development, it will be undefined, and we will fall back to the local dev server URL.
const appBaseUrl = process.env.EXPO_PUBLIC_APP_URL || `http://${DEV_HOST}:${DEV_PORT}`;

/**
 * The base URL of your backend.
 * e.g., 'https://stacklive.dev' in production or 'http://192.168.1.204:32100' in development.
 */
export const APP_BASE = appBaseUrl.replace(/\/$/, ""); // Remove trailing slash if present

/**
 * Base path for all preview endpoints.
 */
export const PREVIEW_PATH = '/mobile-preview';

/**
 * Full base URI for preview endpoints.
 */
export const BASE_URI = `${APP_BASE}${PREVIEW_PATH}`;

/**
 * URI for webview previews.
 */
export const WEBVIEW_URI = `${APP_BASE}${PREVIEW_PATH}`;

/**
 * Enum for supported page types in the app previews.
 */
export type PageType = 'home' | 'trending' | 'my-apps' | 'collections' | 'profile';

/**
 * Configuration interface for each page type.
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
};

/**
 * Generates a URI for a specific page type.
 */
export function getPageUri(pageType: PageType, searchQuery?: string, theme?: 'light' | 'dark'): string {
  const config = pageConfigs[pageType];
  const url = new URL(BASE_URI);
  if (config.query) {
    const [key, value] = config.query.split('=');
    url.searchParams.set(key, value);
  }
  if (theme) {
    url.searchParams.set('theme', theme);
  }
  if (searchQuery) {
    url.searchParams.set('q', encodeURIComponent(searchQuery));
  }
  return url.toString();
}

/**
 * Generates a URI for webview context.
 */
export function getWebViewUri(pageType: PageType, searchQuery?: string, theme?: 'light' | 'dark'): string {
  const config = pageConfigs[pageType];
  const url = new URL(WEBVIEW_URI);
  if (config.query) {
    const [key, value] = config.query.split('=');
    url.searchParams.set(key, value);
  }
  if (theme) {
    url.searchParams.set('theme', theme);
  }
  if (searchQuery) {
    url.searchParams.set('q', encodeURIComponent(searchQuery));
  }
  return url.toString();
}

/**
 * Generates URI for the profile view.
 */
export function getProfileUri(): string {
  const url = new URL(BASE_URI);
  url.searchParams.set('view', 'profile');
  return url.toString();
}

/**
 * Generates URI for a specific app by ID.
 */
export function getAppUri(id: string): string {
  return `${APP_BASE}/app/${id}`;
}

/**
 * Generates preview URI for an app detail by ID.
 */
export function getAppDetailUri(id: string): string {
  return `${APP_BASE}/app/${id}`;
}

/**
 * Generates webview URI for an app detail by ID.
 */
export function getWebViewAppDetailUri(id: string, theme?: 'light' | 'dark'): string {
  const url = new URL(`${APP_BASE}/app/${id}`);
  if (theme) {
    url.searchParams.set('theme', theme);
  }
  url.searchParams.set('webview', 'true');
  return url.toString();
}

/**
 * Shared injected JavaScript for WebView.
 */
export const INJECTED_JAVASCRIPT = `
  (function() {
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
 * Common props for WebView instances.
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
 * Shared style objects for WebView.
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
 */
export function createWebViewHandlers(router: any) {
  const handleShouldStartLoadWithRequest = (request: any) => {
    console.log('App detail WebView navigation:', request.url);
    return true;
  };

  const onMessage = (event: any) => {
    console.log('Message from WebView:', event.nativeEvent.data);
    if (event.nativeEvent.data === 'close') {
      router.back();
    }
  };

  return { onShouldStartLoadWithRequest: handleShouldStartLoadWithRequest, onMessage };
}

/**
 * Configuration for app detail page.
 */
export const APP_DETAIL_CONFIG = {
  hideSearch: true,
  hideHeader: true,
  hideTabs: true,
  type: 'fullScreenModal' as 'fullScreenModal' | 'modal' | 'card' | 'transparentModal',
  animation: 'slide_from_bottom' as 'slide_from_bottom' | 'fade' | 'flip' | 'none',
  height: undefined as number | undefined,
} as const;

/**
 * Interface for splash page configuration.
 */
export interface SplashConfig {
  duration: number;
  backgroundColor: string;
  logoPath: string;
  hasImages: boolean;
  animationDuration: number;
}

/**
 * Base URL for API endpoints (uses same base as app).
 */
export const API_BASE = APP_BASE;

/**
 * Configuration for the splash page.
 */
export const splashConfig: SplashConfig = {
  duration: 3000,
  backgroundColor: '#000',
  logoPath: '../assets/images/icon.png',
  hasImages: true,
  animationDuration: 1000,
};

/**
 * Authentication API configuration.
 * These endpoints will be called when creating/signing in users.
 */
export interface AuthConfig {
  /** API endpoint for creating a new user account */
  createAccountEndpoint: string;
  /** API endpoint for signing in an existing user */
  signInEndpoint: string;
  /** API endpoint for native email/password signup */
  nativeSignupEndpoint: string;
  /** API endpoint for native email/password login */
  nativeLoginEndpoint: string;
  /** API endpoint for Apple native sign-in */
  appleNativeSigninEndpoint: string;
  /** Google OAuth client ID for web/Android */
  googleClientId: string;
  /** Google OAuth client ID for iOS */
  googleClientIdIOS: string;
}

/**
 * Authentication configuration - update these values with your actual API endpoints.
 * The owner will provide the actual API configuration later.
 */
export const authConfig: AuthConfig = {
  // TODO: Add your API endpoint for creating user accounts
  createAccountEndpoint: `${API_BASE}/api/auth/signup`,
  // TODO: Add your API endpoint for signing in users
  signInEndpoint: `${API_BASE}/api/auth/signin`,
  nativeSignupEndpoint: `${API_BASE}/api/auth/native-signup`,
  nativeLoginEndpoint: `${API_BASE}/api/auth/native-login`,
  appleNativeSigninEndpoint: `${API_BASE}/api/auth/apple/native-signin`,
  // TODO: Add your Google OAuth client ID
  googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  // TODO: Add your Google OAuth client ID for iOS
  googleClientIdIOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '',
};