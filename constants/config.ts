import Constants from 'expo-constants';

/**
 * Server host configuration derived from Expo constants.
 * Uses hostUri from expoConfig if available, otherwise falls back to a local network IP.
 * This allows dynamic host detection in development.
 */
const hostUri = Constants.expoConfig?.hostUri;
const expoHost = hostUri ? hostUri.split(':')[0] : undefined;
export const HOST = expoHost || '192.168.12.152';

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
export const BASE_URI = `http://${HOST}:${PORT}${PREVIEW_PATH}`;

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
export const WEBVIEW_URI = `http://${LOCAL_HOST}:${PORT}${PREVIEW_PATH}`;

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
export const APP_BASE = `http://${HOST}:${PORT}`;

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

