import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAuthStyles } from '../styles/authStyles';

export default function AuthScreen() {
  const { theme, colors } = useTheme();
  const styles = getAuthStyles(theme);
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name.trim())) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save the user's name directly to their Firebase profile
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
      }
    } catch (error) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Enter your account email above first, then tap "Forgot Password?" again.');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Check Your Email', `A password reset link has been sent to ${email.trim()}.`);
    } catch (error) {
      Alert.alert('Reset Failed', error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.authContainer, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.authHeaderContainer}>
        <Text style={styles.authTitle}>SpendLens</Text>
        <Text style={styles.authSubtitle}>
          {isLogin ? 'Spot financial leaks & regain control' : 'Create an account to start tracking'}
        </Text>
      </View>

      <View style={styles.authFormContainer}>
        {!isLogin && (
          <TextInput
            style={styles.authInput}
            placeholder="Full Name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.authInput}
          placeholder="Email address"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.authInput}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {isLogin && (
          <TouchableOpacity
            style={styles.authForgotButton}
            onPress={handleForgotPassword}
            disabled={resetLoading}
          >
            <Text style={styles.authForgotText}>
              {resetLoading ? 'Sending reset link...' : 'Forgot Password?'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.authButton}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.authButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.authSwitchButton}>
          <Text style={styles.authSwitchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.authHighlightText}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}