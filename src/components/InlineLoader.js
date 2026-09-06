import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function InlineLoader({ text, size = 'small', color = '#3B82F6', textColor = '#94A3B8' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, { color: textColor }]}>{text}</Text>}
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
    fontSize: 13,
  },
});