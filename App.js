import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import * as SplashScreen from 'expo-splash-screen';
import { auth } from './src/config/firebase';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Prevent splash screen from auto-hiding before auth state resolves
SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Add Expense') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Add Expense" component={AddExpenseScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const { theme, colors } = useTheme();

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, async (authenticatedUser) => {
      setUser(authenticatedUser);
      if (initializing) {
        setInitializing(false);
        // Hide splash screen once initial Firebase auth state settles
        await SplashScreen.hideAsync().catch(() => {});
      }
    });
    return subscriber;
  }, [initializing]);

  const onLayoutRootView = useCallback(async () => {
    if (!initializing) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      onLayout={onLayoutRootView}
    >
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
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

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}