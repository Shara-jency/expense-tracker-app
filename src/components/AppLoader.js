import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';

export default function AppLoader({ message = 'Loading SpendLens...' }) {
  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Image
        source={require('../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Loading Spinner */}
      <ActivityIndicator size="large" color="#3B82F6" style={styles.spinner} />

      {/* Loading Text */}
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 24,
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});