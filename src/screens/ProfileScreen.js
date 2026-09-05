import React from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getProfileStyles } from '../styles/profileStyles';

export default function ProfileScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const styles = getProfileStyles(theme);

  const currentUser = auth.currentUser;
  const userEmail = currentUser?.email || 'User';
  const initial = userEmail.charAt(0).toUpperCase();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => signOut(auth),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Profile & Settings</Text>

      {/* User Information Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.emailText}>{userEmail}</Text>
      </View>

      {/* Dark/Light Mode Switcher */}
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Dark Theme</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}