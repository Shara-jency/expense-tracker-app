import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import * as SplashScreen from 'expo-splash-screen';

import { auth } from './src/config/firebase';
import {
  ThemeProvider,
  useTheme,
} from './src/context/ThemeContext';

// Notification service
import {
  configureNotifications,
  requestNotificationPermissions,
} from './src/services/notificationService';

// Components
import AppLoader from './src/components/AppLoader';
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Prevent splash screen from disappearing too early
SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();

/**
 * Bottom Tab Navigation
 */
function AppTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
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
   * Firebase authentication listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        setUser(authenticatedUser);

        setInitializing(false);

        // Safely hide splash screen
        await SplashScreen.hideAsync().catch(() => {});
      }
    );

    return unsubscribe;
  }, []);

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
        <NavigationContainer>
          <AppTabs />
        </NavigationContainer>
      )}
    </SafeAreaView>
  );
}

/**
 * Root application
//  */
// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <ThemeProvider>
//         <MainApp />
//       </ThemeProvider>
//     </SafeAreaProvider>
//   );
// }

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}