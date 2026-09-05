import React from 'react';
import { View, Text } from 'react-native';
import { getGlobalStyles } from '../styles/globalStyles';

export default function StatCard({ title, amount, subtitle, isLeak = false, theme = 'dark' }) {
  const styles = getGlobalStyles(theme);

  return (
    <View style={[styles.statCard, isLeak && styles.statCardLeak]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statAmount, isLeak && styles.statLeakAmount]}>₹{amount}</Text>
      {subtitle && <Text style={styles.transactionMeta}>{subtitle}</Text>}
    </View>
  );
}