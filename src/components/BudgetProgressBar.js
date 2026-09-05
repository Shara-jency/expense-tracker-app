import React from 'react';
import { View, Text } from 'react-native';
import { getBudgetStyles } from '../styles/budgetStyles';

export default function BudgetProgressBar({ category, spent, limit, theme = 'dark' }) {
  const styles = getBudgetStyles(theme);

  const percentage = Math.min(Math.round((spent / limit) * 100), 100);
  
  // Dynamic status color
  let barColor = '#10B981'; // Green (<75%)
  if (percentage >= 90) {
    barColor = '#EF4444'; // Red (≥90%)
  } else if (percentage >= 75) {
    barColor = '#F59E0B'; // Yellow (75-89%)
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.categoryName}>{category}</Text>
        <Text style={styles.amountText}>
          ₹{spent.toFixed(0)} / ₹{limit.toFixed(0)} ({percentage}%)
        </Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>

      <Text style={[styles.statusText, { color: barColor }]}>
        {percentage >= 100
          ? '⚠️ Budget Exceeded!'
          : percentage >= 75
          ? '⚡ Approaching Limit'
          : '✓ Within Budget'}
      </Text>
    </View>
  );
}