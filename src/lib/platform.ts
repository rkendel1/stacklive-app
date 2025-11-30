import { Platform } from 'react-native';

/**
 * Cross-platform utilities for handling platform-specific functionality.
 * This module provides consistent APIs across iOS and Android.
 */

/**
 * Returns true if running on iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Returns true if running on Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Returns true if running on web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Returns true if running on a native platform (iOS or Android)
 */
export const isNative = isIOS || isAndroid;

/**
 * Platform-specific value helper.
 * Returns the appropriate value based on the current platform.
 * 
 * @example
 * const padding = platformSelect({ ios: 20, android: 16, default: 12 });
 */
export function platformSelect<T>(options: {
  ios?: T;
  android?: T;
  web?: T;
  native?: T;
  default: T;
}): T {
  if (isIOS && options.ios !== undefined) return options.ios;
  if (isAndroid && options.android !== undefined) return options.android;
  if (isWeb && options.web !== undefined) return options.web;
  if (isNative && options.native !== undefined) return options.native;
  return options.default;
}

/**
 * Returns the platform-specific font family for monospace text.
 */
export const monospaceFontFamily = platformSelect({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

/**
 * Authentication capabilities by platform
 */
export const authCapabilities = {
  /** Apple Sign-In is only available on iOS */
  supportsAppleSignIn: isIOS,
  /** Google Sign-In is available on all platforms */
  supportsGoogleSignIn: true,
  /** Email/password authentication is available on all platforms */
  supportsEmailAuth: true,
};

/**
 * Gets the available authentication providers for the current platform.
 * @returns Array of available auth provider names
 */
export function getAvailableAuthProviders(): ('apple' | 'google' | 'email')[] {
  const providers: ('apple' | 'google' | 'email')[] = [];
  
  if (authCapabilities.supportsAppleSignIn) {
    providers.push('apple');
  }
  if (authCapabilities.supportsGoogleSignIn) {
    providers.push('google');
  }
  if (authCapabilities.supportsEmailAuth) {
    providers.push('email');
  }
  
  return providers;
}
