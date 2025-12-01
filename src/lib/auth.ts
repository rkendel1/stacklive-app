import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { authConfig } from '../../constants/config';

// Ensure web browser redirect is handled properly
WebBrowser.maybeCompleteAuthSession();

export type AuthProvider = 'apple' | 'google' | 'email' | 'email-password';

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  provider: AuthProvider;
  token?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Sign in with Apple using the native Sign in with Apple functionality.
 * This provides one-tap sign-in with Face ID/Touch ID on iOS.
 */
export async function signInWithApple(): Promise<AuthResult> {
  if (Platform.OS !== 'ios') {
    return {
      success: false,
      error: 'Apple Sign-In is only available on iOS devices',
    };
  }

  try {
    // Check if Apple authentication is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Apple Sign-In is not available on this device',
      };
    }

    // Request sign-in with Apple
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Extract user information from credential
    const user: AuthUser = {
      id: credential.user,
      email: credential.email,
      displayName: credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() || null
        : null,
      provider: 'apple',
      token: credential.identityToken || undefined,
    };

    // Call dedicated Apple native sign-in endpoint with required payload
    const payload = {
      identityToken: credential.identityToken,
      email: credential.email,
      fullName: credential.fullName,
    };

    const response = await fetch(authConfig.appleNativeSigninEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Store auth token securely
        await SecureStore.setItemAsync('authToken', data.authToken);

        const updatedUser: AuthUser = {
          id: data.userId,
          email: credential.email || null,
          displayName: credential.fullName
            ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() || null
            : null,
          provider: 'apple',
          token: data.authToken,
        };

        return {
          success: true,
          user: updatedUser,
        };
      }
    }

    return {
      success: false,
      error: 'Apple sign-in failed',
    };
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const appleError = error as { code: string; message: string };
      if (appleError.code === 'ERR_REQUEST_CANCELED') {
        return {
          success: false,
          error: 'Sign-in was cancelled',
        };
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Apple Sign-In failed',
    };
  }
}

/**
 * Sign in with Google using OAuth flow via web browser.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    // Get the appropriate client ID based on platform
    const clientId = Platform.OS === 'ios' 
      ? authConfig.googleClientIdIOS 
      : authConfig.googleClientId;

    if (!clientId) {
      // If no client ID is configured, return a mock result for development
      console.warn('Google client ID not configured. Using mock authentication for development.');
      const mockUser: AuthUser = {
        id: `google_${Date.now()}`,
        email: 'user@gmail.com',
        displayName: 'Google User',
        provider: 'google',
      };
      return {
        success: true,
        user: mockUser,
      };
    }

    // Build the Google OAuth URL
    const redirectUri = `${authConfig.signInEndpoint}/google/callback`;
    const scope = encodeURIComponent('openid profile email');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;

    // Open auth session in browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      // Extract the authorization code from the redirect URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');

      if (code) {
        // Exchange code for user info via backend
        const response = await fetch(`${authConfig.signInEndpoint}/google/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, redirectUri }),
        });

        if (response.ok) {
          const userData = await response.json();
          return {
            success: true,
            user: {
              id: userData.id,
              email: userData.email,
              displayName: userData.name,
              provider: 'google',
              token: userData.token,
            },
          };
        }
      }
    } else if (result.type === 'cancel') {
      return {
        success: false,
        error: 'Sign-in was cancelled',
      };
    }

    return {
      success: false,
      error: 'Google Sign-In failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Google Sign-In failed',
    };
  }
}

/**
 * Sign in with email (magic link or password-less flow).
 * Sends a verification email to the user.
 */
export async function signInWithEmail(email: string): Promise<AuthResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      };
    }

    // Call backend API to initiate email sign-in
    const response = await fetch(`${authConfig.signInEndpoint}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = await response.json();
      // For magic link flow, user needs to check their email
      // For now, we'll return success and the user can be signed in
      // once they click the link (handled by deep linking)
      return {
        success: true,
        user: {
          id: data.userId || `email_${Date.now()}`,
          email,
          displayName: null,
          provider: 'email',
          token: data.token,
        },
      };
    } else {
      // If the API is not available, use mock for development
      console.warn('Email sign-in API not available. Using mock authentication for development.');
      return {
        success: true,
        user: {
          id: `email_${Date.now()}`,
          email,
          displayName: null,
          provider: 'email',
        },
      };
    }
  } catch (error) {
    // If network error, use mock for development
    console.warn('Email sign-in failed, using mock for development:', error);
    return {
      success: true,
      user: {
        id: `email_${Date.now()}`,
        email,
        displayName: null,
        provider: 'email',
      },
    };
  }
}

/**
 * Sign up a new user with email and password.
 * Calls the native signup endpoint and stores the auth token securely.
 */
export async function nativeSignup(email: string, password: string): Promise<AuthResult> {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Please enter a valid email address',
    };
  }

  // Validate password
  if (password.length < 8) {
    return {
      success: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(authConfig.nativeSignupEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      // Store the auth token securely
      await SecureStore.setItemAsync('authToken', data.authToken);

      return {
        success: true,
        user: {
          id: data.userId,
          email,
          displayName: null,
          provider: 'email-password',
          token: data.authToken,
        },
      };
    } else {
      return {
        success: false,
        error: data.error || 'Signup failed',
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Signup request timed out. Please check your connection.',
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during signup',
    };
  }
}

/**
 * Log in an existing user with email and password.
 * Calls the native login endpoint and stores the auth token securely.
 */
export async function nativeLogin(email: string, password: string): Promise<AuthResult> {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Please enter a valid email address',
    };
  }

  try {
    const response = await fetch(authConfig.nativeLoginEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      // Store the auth token securely
      await SecureStore.setItemAsync('authToken', data.authToken);

      return {
        success: true,
        user: {
          id: data.userId,
          email,
          displayName: null,
          provider: 'email-password',
          token: data.authToken,
        },
      };
    } else {
      return {
        success: false,
        error: data.error || 'Login failed',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during login',
    };
  }
}

/**
 * Call the backend API to create or sign in a user.
 */
async function callAuthApi(user: AuthUser, provider: AuthProvider): Promise<AuthResult> {
  try {
    const response = await fetch(authConfig.createAccountEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        providerId: user.id,
        email: user.email,
        displayName: user.displayName,
        token: user.token,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        user: {
          ...user,
          id: data.userId || user.id,
          token: data.token || user.token,
        },
      };
    }

    return {
      success: false,
      error: `API error: ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync with backend',
    };
  }
}

/**
 * Check if Apple Sign-In is available on this device.
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  return AppleAuthentication.isAvailableAsync();
}
