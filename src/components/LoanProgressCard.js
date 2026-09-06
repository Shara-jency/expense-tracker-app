import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

export default function LoanProgressCard({ loan, theme = 'dark' }) {
  const currentColors = colors[theme] || colors.dark;

  const maturityLabel = new Date(loan.maturityDate).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={[styles.card, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.textPrimary }]} numberOfLines={1}>
          {loan.title}
        </Text>
        <Text style={[styles.badge, loan.isMatured ? styles.badgeDone : styles.badgeActive]}>
          {loan.isMatured ? '✓ Matured' : `${loan.monthsRemaining} mo left`}
        </Text>
      </View>

      <Text style={[styles.emi, { color: currentColors.textPrimary }]}>
        ₹{loan.monthlyAmount.toLocaleString('en-IN')}
        <Text style={[styles.emiSuffix, { color: currentColors.textSecondary }]}> / month</Text>
      </Text>

      <View style={[styles.footer, { borderTopColor: currentColors.border }]}>
        <Text style={[styles.footerLabel, { color: currentColors.textSecondary }]}>
          🏁 Payoff: {maturityLabel}
        </Text>
        {!loan.isMatured && (
          <Text style={[styles.footerLabel, { color: currentColors.textSecondary }]}>
            ₹{Math.round(loan.projectedRemainingPayout).toLocaleString('en-IN')} remaining
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  badgeActive: {
    color: '#93C5FD',
    backgroundColor: '#1E3A5F',
  },
  badgeDone: {
    color: '#6EE7B7',
    backgroundColor: '#064E3B',
  },
  emi: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  emiSuffix: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
  },
  footerLabel: {
    fontSize: 11,
  },
});
