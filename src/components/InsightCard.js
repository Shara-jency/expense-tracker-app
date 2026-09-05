import React from 'react';
import { View, Text } from 'react-native';
import { getGlobalStyles } from '../styles/globalStyles';

export default function InsightCard({ category, currentMonth, previousMonth, percentageIncrease, theme = 'dark' }) {
  const styles = getGlobalStyles(theme);

  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightBadge}>⚠️ SPEND LEAK DETECTED</Text>
        <Text style={styles.insightPercentage}>+{percentageIncrease}%</Text>
      </View>
      <Text style={styles.insightText}>
        Your <Text style={styles.transactionTitle}>{category}</Text> expense rose from ₹{previousMonth} to ₹{currentMonth} this month.
      </Text>
    </View>
  );
}