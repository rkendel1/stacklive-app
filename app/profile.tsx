import { Text as ThemedText, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTrendingApps } from '@/hooks/useTrendingApps';
import { MiniApp } from '@/src/lib/miniapps';
import { monospaceFontFamily } from '@/src/lib/platform';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Storage keys
const STATS_STORAGE_KEY = 'user_stats';
const CONTEXT_STORAGE_KEY = 'user_context_data';
const PRIVACY_SETTINGS_KEY = 'privacy_settings';
const AUTH_PROVIDERS_KEY = 'auth_providers';
const MY_APPS_USAGE_KEY = 'my_apps_usage';

interface UserStats {
  activeStreaks: number;
  appsUsedThisWeek: number;
  confettiExploded: number;
  daysInApp: number;
}

interface ContextData {
  preferences: { [key: string]: string };
  recentApps: string[];
  searchHistory: string[];
}

interface PrivacySettings {
  shareContextBetweenApps: boolean;
  profileDiscoverable: boolean;
  allowAppsToReadStreaks: boolean;
  appearInLeaderboards: boolean;
}

interface AuthProviders {
  apple: boolean;
  google: boolean;
  passwordSet: boolean;
}

interface AppUsage {
  appId: string;
  usageCount: number;
  lastUsed: number;
}

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// Default stats - will be replaced with real data from storage
const DEFAULT_STATS: UserStats = {
  activeStreaks: 0,
  appsUsedThisWeek: 0,
  confettiExploded: 0,
  daysInApp: 1,
};

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { hasAccount, displayName, email, signOut, resetOnboarding } = useOnboarding();
  const { allApps } = useTrendingApps();
  const isDark = colorScheme === 'dark';

  // Generate username from displayName or email
  const username = displayName 
    ? displayName.toLowerCase().replace(/\s+/g, '') 
    : email?.split('@')[0] || 'guest';

  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareContextBetweenApps: true,
    profileDiscoverable: true,
    allowAppsToReadStreaks: true,
    appearInLeaderboards: true,
  });

  const [authProviders, setAuthProviders] = useState<AuthProviders>({
    apple: true,
    google: false,
    passwordSet: true,
  });

  const [contextData, setContextData] = useState<ContextData | null>(null);
  const [showContextData, setShowContextData] = useState(false);
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);
  const [mostUsedApps, setMostUsedApps] = useState<MiniApp[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedStats, savedPrivacy, savedAuth, savedContext, savedUsage] = await Promise.all([
          AsyncStorage.getItem(STATS_STORAGE_KEY),
          AsyncStorage.getItem(PRIVACY_SETTINGS_KEY),
          AsyncStorage.getItem(AUTH_PROVIDERS_KEY),
          AsyncStorage.getItem(CONTEXT_STORAGE_KEY),
          AsyncStorage.getItem(MY_APPS_USAGE_KEY),
        ]);

        if (savedStats) setStats(JSON.parse(savedStats));
        if (savedPrivacy) setPrivacySettings(JSON.parse(savedPrivacy));
        if (savedAuth) setAuthProviders(JSON.parse(savedAuth));
        if (savedContext) {
          setContextData(JSON.parse(savedContext));
        } else {
          setContextData({ preferences: {}, recentApps: [], searchHistory: [] });
        }
        if (savedUsage) {
          setAppUsage(JSON.parse(savedUsage));
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };
    loadData();
  }, []);

  // Update most used apps when allApps or appUsage changes
  useEffect(() => {
    if (allApps.length > 0 && appUsage.length > 0) {
      // Sort by usage count and get top 5
      const sortedUsage = [...appUsage].sort((a, b) => b.usageCount - a.usageCount);
      const topAppIds = sortedUsage.slice(0, 5).map(u => u.appId);
      
      const appsMap = allApps.reduce((map, app) => {
        map[app.id] = app;
        return map;
      }, {} as { [key: string]: MiniApp });
      
      const topApps = topAppIds
        .map(id => appsMap[id])
        .filter(Boolean);
      
      setMostUsedApps(topApps);
    } else if (allApps.length > 0) {
      // If no usage data, show first 5 apps as defaults
      setMostUsedApps(allApps.slice(0, 5));
    }
  }, [allApps, appUsage]);

  // Privacy setting handlers
  const updatePrivacySetting = useCallback(async (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    try {
      await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving privacy setting:', error);
    }
  }, [privacySettings]);

  const handleViewContextData = useCallback(() => {
    setShowContextData(!showContextData);
  }, [showContextData]);

  const handleDeleteContextData = useCallback(() => {
    Alert.alert(
      'Delete My Context',
      'This will permanently delete all your context data. Mini-apps will no longer have access to your preferences and history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const emptyContext: ContextData = { preferences: {}, recentApps: [], searchHistory: [] };
              await AsyncStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(emptyContext));
              setContextData(emptyContext);
              Alert.alert('Success', 'Your context data has been deleted.');
            } catch (error) {
              console.error('Error deleting context data:', error);
            }
          },
        },
      ]
    );
  }, []);

  const handleDownloadData = useCallback(() => {
    Alert.alert(
      'Download All My Data',
      'We\'ll prepare a JSON export of all your data and send it to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // In production, this would trigger a backend process
            Alert.alert('Data Export Requested', 'You\'ll receive an email with your data within 24 hours.');
          },
        },
      ]
    );
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This deletes everything forever. All your data, preferences, streaks, and history will be permanently removed. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                STATS_STORAGE_KEY,
                CONTEXT_STORAGE_KEY,
                PRIVACY_SETTINGS_KEY,
                AUTH_PROVIDERS_KEY,
              ]);
              await signOut();
              await resetOnboarding();
              router.replace('/onboarding');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  }, [signOut, resetOnboarding, router]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.replace('/onboarding');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [signOut, router]);

  const handleCopyProfileLink = useCallback(async () => {
    Alert.alert('Profile Link', `stacklive.dev/@${username}`, [
      { text: 'OK' }
    ]);
  }, [username]);

  const openLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Map icon names to emojis for display
  const getAppEmoji = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      'palette': '🎨',
      'clock': '⏱️',
      'music-note': '🎵',
      'book-open': '📖',
      'cloud': '☁️',
      'zap': '⚡',
      'box': '📦',
      'alarm-clock': '⏰',
    };
    return iconMap[iconName?.toLowerCase()] || '📱';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#f5f5f7',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      paddingTop: 24,
      backgroundColor: isDark ? '#1c1c1e' : '#fff',
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    headerSpacer: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: 40,
    },
    
    // Avatar Section
    avatarSection: {
      alignItems: 'center',
      paddingVertical: 24,
      backgroundColor: isDark ? '#1c1c1e' : '#fff',
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 12,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark ? '#3a3a3c' : '#e5e5ea',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editAvatarButton: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: isDark ? '#1c1c1e' : '#fff',
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    userHandle: {
      fontSize: 16,
      color: isDark ? '#8e8e93' : '#6c6c70',
      marginTop: 2,
    },
    copyLinkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: isDark ? '#3a3a3c' : '#f2f2f7',
      borderRadius: 14,
    },
    copyLinkText: {
      fontSize: 13,
      color: '#007AFF',
      marginLeft: 4,
    },

    // Section styling
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 32,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#8e8e93' : '#6c6c70',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionAction: {
      fontSize: 13,
      color: '#007AFF',
    },
    
    // Card styling
    card: {
      backgroundColor: isDark ? '#1c1c1e' : '#fff',
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 44,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#38383a' : '#c6c6c8',
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rowIcon: {
      width: 28,
      height: 28,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    rowTextContainer: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
    },
    rowSubtitle: {
      fontSize: 13,
      color: isDark ? '#8e8e93' : '#6c6c70',
      marginTop: 1,
    },
    rowValue: {
      fontSize: 16,
      color: isDark ? '#8e8e93' : '#6c6c70',
    },
    rowChevron: {
      marginLeft: 8,
    },
    
    // Account row styles
    accountStatus: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#34c759',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    verifiedText: {
      fontSize: 11,
      color: '#fff',
      fontWeight: '600',
      marginLeft: 2,
    },
    connectedText: {
      fontSize: 14,
      color: '#34c759',
    },
    notConnectedText: {
      fontSize: 14,
      color: isDark ? '#8e8e93' : '#6c6c70',
    },

    // Favorite Apps
    favoriteAppsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    favoriteAppsScroll: {
      flexDirection: 'row',
    },
    favoriteAppItem: {
      alignItems: 'center',
      marginRight: 16,
      width: 64,
    },
    favoriteAppIcon: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: isDark ? '#3a3a3c' : '#f2f2f7',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    favoriteAppEmoji: {
      fontSize: 28,
    },
    favoriteAppName: {
      fontSize: 11,
      color: isDark ? '#8e8e93' : '#6c6c70',
      textAlign: 'center',
    },

    // Empty apps state
    emptyAppsContainer: {
      padding: 24,
      alignItems: 'center',
    },
    emptyAppsText: {
      fontSize: 14,
      color: isDark ? '#8e8e93' : '#6c6c70',
      textAlign: 'center',
      marginBottom: 12,
    },
    exploreButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#007AFF',
      borderRadius: 16,
    },
    exploreButtonText: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '600',
    },

    // Stats grid
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    statItem: {
      width: '50%',
      padding: 16,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    statLabel: {
      fontSize: 13,
      color: isDark ? '#8e8e93' : '#6c6c70',
      marginTop: 4,
      textAlign: 'center',
    },
    statDividerV: {
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: isDark ? '#38383a' : '#c6c6c8',
    },
    statDividerH: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#38383a' : '#c6c6c8',
    },

    // Context data view
    contextDataContainer: {
      padding: 16,
      backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7',
    },
    contextDataSection: {
      marginBottom: 16,
    },
    contextDataLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? '#8e8e93' : '#6c6c70',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    contextDataValue: {
      fontSize: 13,
      color: isDark ? '#fff' : '#000',
      fontFamily: monospaceFontFamily,
    },
    contextDeleteButton: {
      marginTop: 8,
    },
    contextDeleteText: {
      fontSize: 14,
      color: '#ff3b30',
      fontWeight: '500',
    },

    // Danger button
    dangerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    dangerText: {
      fontSize: 16,
      color: '#ff3b30',
    },

    // Footer
    footer: {
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    versionText: {
      fontSize: 13,
      color: isDark ? '#8e8e93' : '#6c6c70',
      marginBottom: 8,
    },
    footerLinks: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerLink: {
      fontSize: 13,
      color: '#007AFF',
    },
    footerDot: {
      fontSize: 13,
      color: isDark ? '#8e8e93' : '#6c6c70',
      marginHorizontal: 8,
    },
    logoutButton: {
      marginTop: 16,
    },
    logoutText: {
      fontSize: 16,
      color: '#ff3b30',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
        >
          <FontAwesome name="chevron-left" size={20} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        <View style={styles.headerSpacer} />
      </SafeAreaView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Avatar + Name Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <FontAwesome name="user" size={44} color={isDark ? '#8e8e93' : '#8e8e93'} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <FontAwesome name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.userName}>
            {displayName || (hasAccount ? 'User' : 'Guest')}
          </ThemedText>
          <ThemedText style={styles.userHandle}>@{username}</ThemedText>
          <TouchableOpacity style={styles.copyLinkButton} onPress={handleCopyProfileLink}>
            <FontAwesome name="link" size={12} color="#007AFF" />
            <ThemedText style={styles.copyLinkText}>Copy profile link</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Accounts Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Accounts</ThemedText>
        </View>
        <View style={styles.card}>
          {/* Email */}
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#007AFF' }]}>
                <FontAwesome name="envelope" size={14} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>{email || 'No email'}</ThemedText>
            </View>
            {email && (
              <View style={styles.verifiedBadge}>
                <FontAwesome name="check" size={8} color="#fff" />
                <ThemedText style={styles.verifiedText}>Verified</ThemedText>
              </View>
            )}
          </View>
          
          {/* Apple */}
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#000' }]}>
                <FontAwesome name="apple" size={16} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>Apple</ThemedText>
            </View>
            <ThemedText style={authProviders.apple ? styles.connectedText : styles.notConnectedText}>
              {authProviders.apple ? 'Connected' : 'Not connected'}
            </ThemedText>
          </View>
          
          {/* Google */}
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#fff', borderWidth: 1, borderColor: isDark ? '#38383a' : '#c6c6c8' }]}>
                <FontAwesome name="google" size={14} color="#4285F4" />
              </View>
              <ThemedText style={styles.rowTitle}>Google</ThemedText>
            </View>
            <ThemedText style={authProviders.google ? styles.connectedText : styles.notConnectedText}>
              {authProviders.google ? 'Connected' : 'Not connected'}
            </ThemedText>
          </View>
          
          {/* Password */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#8e8e93' }]}>
                <FontAwesome name="lock" size={14} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>Password</ThemedText>
            </View>
            <ThemedText style={authProviders.passwordSet ? styles.connectedText : styles.notConnectedText}>
              {authProviders.passwordSet ? 'Set' : 'Not set'}
            </ThemedText>
          </View>
        </View>

        {/* Memory & Context Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Memory & Context</ThemedText>
        </View>
        <View style={styles.card}>
          {/* Share context toggle */}
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#5856d6' }]}>
                <FontAwesome name="refresh" size={14} color="#fff" />
              </View>
              <View style={styles.rowTextContainer}>
                <ThemedText style={styles.rowTitle}>Share my context between apps</ThemedText>
              </View>
            </View>
            <Switch
              value={privacySettings.shareContextBetweenApps}
              onValueChange={(v) => updatePrivacySetting('shareContextBetweenApps', v)}
              trackColor={{ false: '#767577', true: '#34c759' }}
              thumbColor="#fff"
            />
          </View>
          
          {/* View context data */}
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={handleViewContextData}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#007AFF' }]}>
                <FontAwesome name="eye" size={14} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>View my context data</ThemedText>
            </View>
            <FontAwesome 
              name={showContextData ? 'chevron-up' : 'chevron-right'} 
              size={14} 
              color={isDark ? '#8e8e93' : '#c7c7cc'} 
              style={styles.rowChevron}
            />
          </TouchableOpacity>

          {showContextData && contextData && (
            <View style={styles.contextDataContainer}>
              <View style={styles.contextDataSection}>
                <ThemedText style={styles.contextDataLabel}>Preferences</ThemedText>
                <ThemedText style={styles.contextDataValue}>
                  {Object.keys(contextData.preferences).length > 0 
                    ? JSON.stringify(contextData.preferences, null, 2)
                    : 'No preferences saved'}
                </ThemedText>
              </View>
              <View style={styles.contextDataSection}>
                <ThemedText style={styles.contextDataLabel}>Recent Apps</ThemedText>
                <ThemedText style={styles.contextDataValue}>
                  {contextData.recentApps.length > 0 
                    ? contextData.recentApps.join(', ')
                    : 'No recent apps'}
                </ThemedText>
              </View>
              <View style={styles.contextDataSection}>
                <ThemedText style={styles.contextDataLabel}>Search History</ThemedText>
                <ThemedText style={styles.contextDataValue}>
                  {contextData.searchHistory.length > 0 
                    ? contextData.searchHistory.join(', ')
                    : 'No search history'}
                </ThemedText>
              </View>
            </View>
          )}
          
          {/* Delete context */}
          <TouchableOpacity style={styles.row} onPress={handleDeleteContextData}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#ff3b30' }]}>
                <FontAwesome name="trash" size={14} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>Delete my context</ThemedText>
            </View>
            <FontAwesome name="chevron-right" size={14} color={isDark ? '#8e8e93' : '#c7c7cc'} style={styles.rowChevron} />
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Privacy</ThemedText>
        </View>
        <View style={styles.card}>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#34c759' }]}>
                <FontAwesome name="search" size={14} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>Make my profile discoverable</ThemedText>
            </View>
            <Switch
              value={privacySettings.profileDiscoverable}
              onValueChange={(v) => updatePrivacySetting('profileDiscoverable', v)}
              trackColor={{ false: '#767577', true: '#34c759' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#ff9500' }]}>
                <FontAwesome name="star" size={14} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>Allow apps to read my streaks & favorites</ThemedText>
            </View>
            <Switch
              value={privacySettings.allowAppsToReadStreaks}
              onValueChange={(v) => updatePrivacySetting('allowAppsToReadStreaks', v)}
              trackColor={{ false: '#767577', true: '#34c759' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#5856d6' }]}>
                <FontAwesome name="trophy" size={14} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>Appear in leaderboards</ThemedText>
            </View>
            <Switch
              value={privacySettings.appearInLeaderboards}
              onValueChange={(v) => updatePrivacySetting('appearInLeaderboards', v)}
              trackColor={{ false: '#767577', true: '#34c759' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Most Used Apps Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Most Used Apps</ThemedText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/my-apps')}>
            <ThemedText style={styles.sectionAction}>See all</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {mostUsedApps.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoriteAppsContainer}
            >
              {mostUsedApps.map((app) => (
                <TouchableOpacity 
                  key={app.id} 
                  style={styles.favoriteAppItem}
                  onPress={() => router.push(`/(modal)/app-detail/${app.id}`)}
                >
                  <View style={styles.favoriteAppIcon}>
                    <ThemedText style={styles.favoriteAppEmoji}>
                      {getAppEmoji(app.icon)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.favoriteAppName} numberOfLines={1}>{app.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyAppsContainer}>
              <ThemedText style={styles.emptyAppsText}>
                Start using apps to see your favorites here
              </ThemedText>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/trending')}
              >
                <ThemedText style={styles.exploreButtonText}>Explore Apps</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* My Stats Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>My Stats</ThemedText>
        </View>
        <View style={styles.card}>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, styles.statDividerV, styles.statDividerH]}>
              <ThemedText style={styles.statValue}>{stats.activeStreaks}</ThemedText>
              <ThemedText style={styles.statLabel}>Active streaks</ThemedText>
            </View>
            <View style={[styles.statItem, styles.statDividerH]}>
              <ThemedText style={styles.statValue}>{stats.appsUsedThisWeek}</ThemedText>
              <ThemedText style={styles.statLabel}>Apps used this week</ThemedText>
            </View>
            <View style={[styles.statItem, styles.statDividerV]}>
              <ThemedText style={styles.statValue}>{formatNumber(stats.confettiExploded)}</ThemedText>
              <ThemedText style={styles.statLabel}>Confetti exploded</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{stats.daysInApp}</ThemedText>
              <ThemedText style={styles.statLabel}>Days in App</ThemedText>
            </View>
          </View>
        </View>

        {/* Data & Account Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Data & Account</ThemedText>
        </View>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={handleDownloadData}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIcon, { backgroundColor: '#007AFF' }]}>
                <FontAwesome name="download" size={14} color="#fff" />
              </View>
              <ThemedText style={styles.rowTitle}>Download all my data</ThemedText>
            </View>
            <FontAwesome name="chevron-right" size={14} color={isDark ? '#8e8e93' : '#c7c7cc'} style={styles.rowChevron} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount}>
            <ThemedText style={styles.dangerText}>Delete my account (permanent)</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.versionText}>Mini App Central version {APP_VERSION}</ThemedText>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => openLink('https://stacklive.dev/privacy')}>
              <ThemedText style={styles.footerLink}>Privacy Policy</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.footerDot}>•</ThemedText>
            <TouchableOpacity onPress={() => openLink('https://stacklive.dev/terms')}>
              <ThemedText style={styles.footerLink}>Terms</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.footerDot}>•</ThemedText>
            <TouchableOpacity onPress={() => openLink('https://stacklive.dev/support')}>
              <ThemedText style={styles.footerLink}>Support</ThemedText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
