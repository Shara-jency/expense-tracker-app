import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function InlineLoader({ text }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#3B82F6" />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  text: {
    color: '#94A3B8',
    fontSize: 13,
  },
});