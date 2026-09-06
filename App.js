import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, AppState, Alert } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as SplashScreen from 'expo-splash-screen';

import { auth } from './src/config/firebase';
import {
  ThemeProvider,
  useTheme,
} from './src/context/ThemeContext';
import { PrivacyProvider } from './src/context/PrivacyContext';
import { DataProvider } from './src/context/DataContext';

// Notification service
import {
  configureNotifications,
  requestNotificationPermissions,
} from './src/services/notificationService';

// Session service (idle / closed-app auto logout)
import {
  recordActivity,
  hasSessionExpired,
  clearActivity,
} from './src/services/sessionService';

// Components
import AppLoader from './src/components/AppLoader';
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Prevent splash screen from disappearing too early
SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();

const showSessionExpiredWarning = () => {
  Alert.alert(
    'Session Expired',
    "You've been logged out after 10 minutes of inactivity. Please log in again."
  );
};

/**
 * Bottom Tab Navigation
 */
function AppTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused
                ? 'home'
                : 'home-outline';
              break;

            case 'Dashboard':
              iconName = focused
                ? 'wallet'
                : 'wallet-outline';
              break;

            case 'Add Expense':
              iconName = focused
                ? 'add-circle'
                : 'add-circle-outline';
              break;

            case 'Analytics':
              iconName = focused
                ? 'pie-chart'
                : 'pie-chart-outline';
              break;

            case 'Profile':
              iconName = focused
                ? 'person'
                : 'person-outline';
              break;

            default:
              iconName = 'ellipse-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={22}
              color={color}
            />
          );
        },

        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 1,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },

        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      })}
    >
      {/* Landing overview: shown right after login, and always reachable
          from the tab bar to get back to the at-a-glance cards. */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Add Expense"
        component={AddExpenseScreen}
      />

      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

/**
 * Main application
 */
function MainApp() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const { theme, colors } = useTheme();

  /**
   * Firebase authentication listener.
   *
   * A restored session (the app was closed and reopened) is checked
   * against the session timeout before it's ever applied to state, so an
   * expired session never flashes the Dashboard before redirecting to login.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        if (authenticatedUser) {
          const expired = await hasSessionExpired();

          if (expired) {
            await clearActivity();
            await signOut(auth);
            showSessionExpiredWarning();
            return; // The resulting null-user callback below finishes startup.
          }

          await recordActivity();
        }

        setUser(authenticatedUser);
        setInitializing(false);

        // Safely hide splash screen
        await SplashScreen.hideAsync().catch(() => {});
      }
    );

    return unsubscribe;
  }, []);

  /**
   * Idle / backgrounded session timeout.
   *
   * Runs only while a user is signed in: a periodic check catches
   * inactivity while the app stays open, and the AppState listener catches
   * the app being backgrounded and reopened after the timeout has passed.
   */
  useEffect(() => {
    if (!user) return;

    const checkExpiry = async () => {
      const expired = await hasSessionExpired();
      if (!expired) return;

      await clearActivity();
      await signOut(auth);
      showSessionExpiredWarning();
    };

    recordActivity();

    const intervalId = setInterval(checkExpiry, 30 * 1000);
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkExpiry();
      }
    });

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [user]);

  /**
   * Initialize notifications.
   *
   * In Expo Go Android:
   * notificationService safely skips this.
   *
   * In Development Build / APK:
   * permission will be requested.
   */
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await configureNotifications();

        const granted =
          await requestNotificationPermissions();

        if (granted) {
          console.log(
            'Notification permissions granted'
          );
        } else {
          console.log(
            'Notifications unavailable or permission denied'
          );
        }
      } catch (error) {
        console.warn(
          'Notification initialization failed:',
          error
        );
      }
    };

    initializeNotifications();
  }, []);

  /**
   * Hide splash screen after layout
   */
  const onLayoutRootView = useCallback(async () => {
    if (!initializing) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [initializing]);

  /**
   * Any touch anywhere in the signed-in app counts as activity and resets
   * the idle-logout clock.
   */
  const handleUserActivity = useCallback(() => {
    if (user) {
      recordActivity();
    }
  }, [user]);

  /**
   * Loading screen
   */
  if (initializing) {
    return <AppLoader />;
  }

  /**
   * Main UI
   */
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      onLayout={onLayoutRootView}
      onTouchStart={handleUserActivity}
    >
      <StatusBar
        barStyle={
          theme === 'dark'
            ? 'light-content'
            : 'dark-content'
        }
      />

      {!user ? (
        <AuthScreen />
      ) : (
        <DataProvider uid={user.uid}>
          <NavigationContainer>
            <AppTabs />
          </NavigationContainer>
        </DataProvider>
      )}
    </SafeAreaView>
  );
}

/**
 * Root application
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <PrivacyProvider>
            <MainApp />
          </PrivacyProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
