import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';
import { usePrivacy } from '../context/PrivacyContext';

export default function LeakCard({ leak, theme = 'dark' }) {
  const currentColors = colors[theme] || colors.dark;
  const { maskAmount } = usePrivacy();

  return (
    <View style={[styles.card, { backgroundColor: currentColors.cardBackground, borderColor: '#EF4444' }]}>
      <View style={styles.header}>
        <Text style={[styles.badge, { backgroundColor: '#7F1D1D', color: '#FCA5A5' }]}>
          ⚠️ DETECTED LEAK
        </Text>
        <Text style={[styles.category, { color: currentColors.textSecondary }]}>
          {leak.category}
        </Text>
      </View>

      <Text style={[styles.title, { color: currentColors.textPrimary }]}>{leak.title}</Text>
      <Text style={[styles.insight, { color: currentColors.textSecondary }]}>
        Purchased {leak.monthlyOccurrences}x in the last 30 days. At this rate, this habit costs{' '}
        {maskAmount(`₹${Math.round(leak.projectedYearlyLeak).toLocaleString('en-IN')}`)}/year.
      </Text>

      <View style={styles.footer}>
        <Text style={styles.projectionLabel}>Projected Yearly Drain:</Text>
        <Text style={styles.projectionAmount}>
          {maskAmount(`-₹${Math.round(leak.projectedYearlyLeak).toLocaleString('en-IN')}`)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  category: {
    fontSize: 11,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 2,
  },
  insight: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: spacing.xs,
  },
  projectionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  projectionAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
  },
});