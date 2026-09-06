import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { usePrivacy } from '../context/PrivacyContext';
import { getProfileStyles } from '../styles/profileStyles';
import {
  areNotificationsAvailable,
  isWeeklyReminderEnabled,
  setWeeklyReminderEnabled,
} from '../services/notificationService';

export default function ProfileScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const styles = getProfileStyles(theme);
  const { monthlyIncome } = useData();
  const { hideAmounts, toggleHideAmounts, maskAmount } = usePrivacy();

  const currentUser = auth.currentUser;
  const displayName = currentUser?.displayName || 'User';
  const userEmail = currentUser?.email || '';
  const initial = displayName.charAt(0).toUpperCase();

  const notificationsAvailable = areNotificationsAvailable();
  const [weeklyReminder, setWeeklyReminder] = useState(true);

  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [savingIncome, setSavingIncome] = useState(false);

  useEffect(() => {
    isWeeklyReminderEnabled().then(setWeeklyReminder);
  }, []);

  const handleToggleReminder = async (value) => {
    setWeeklyReminder(value);
    await setWeeklyReminderEnabled(value);
  };

  const handleEditIncome = () => {
    setIncomeInput(monthlyIncome > 0 ? String(monthlyIncome) : '');
    setIsEditingIncome(true);
  };

  const handleSaveIncome = async () => {
    const parsed = parseFloat(incomeInput);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive monthly income.');
      return;
    }

    setSavingIncome(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { monthlyIncome: parsed }, { merge: true });
      setIsEditingIncome(false);
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setSavingIncome(false);
    }
  };

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
        <Text style={styles.emailText}>{displayName}</Text>
        {userEmail ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
            {userEmail}
          </Text>
        ) : null}
      </View>

      {/* Monthly Income */}
      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.settingText}>Monthly Income</Text>
          <Text style={styles.settingSubtext}>
            Used to calculate your unspent buffer in Analytics.
          </Text>

          {isEditingIncome && (
            <View style={styles.incomeEditRow}>
              <Text style={[styles.settingText, { color: colors.textSecondary }]}>₹</Text>
              <TextInput
                style={[styles.incomeInput, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
                value={incomeInput}
                onChangeText={setIncomeInput}
                autoFocus
              />
            </View>
          )}
        </View>

        {isEditingIncome ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setIsEditingIncome(false)}
              style={styles.iconButton}
              disabled={savingIncome}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveIncome}
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
              disabled={savingIncome}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleEditIncome} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.settingText}>
              {monthlyIncome > 0 ? maskAmount(`₹${monthlyIncome.toLocaleString('en-IN')}`) : 'Not set'}
            </Text>
            <Ionicons name="create-outline" size={16} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* Hide Amounts Privacy Switcher */}
      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.settingText}>Hide Amounts</Text>
          <Text style={styles.settingSubtext}>
            Mask every ₹ figure across the app until you switch it back off.
          </Text>
        </View>
        <Switch
          value={hideAmounts}
          onValueChange={toggleHideAmounts}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#FFFFFF"
        />
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

      {/* Weekly Logging Reminder Switcher */}
      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.settingText}>Weekly Logging Reminder</Text>
          <Text style={styles.settingSubtext}>
            {notificationsAvailable
              ? 'A nudge every Saturday at 9 AM to log any missed expenses.'
              : 'Unavailable in Expo Go on Android — use a development build.'}
          </Text>
        </View>
        <Switch
          value={weeklyReminder}
          onValueChange={handleToggleReminder}
          disabled={!notificationsAvailable}
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
