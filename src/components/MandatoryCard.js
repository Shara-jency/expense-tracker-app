import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getMandatoryStyles } from '../styles/mandatoryStyles';

const monthsBetween = (from, to) =>
  Math.max(0, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()));

const formatMonthYear = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

export default function MandatoryCard({
  title,
  amount,
  dueDate,
  isPaid,
  category,
  maturityDate,
  onTogglePaid,
  theme = 'dark',
}) {
  const styles = getMandatoryStyles(theme);

  const today = new Date().toISOString().split('T')[0];
  const isLoan = category === 'Loan EMI' && !!maturityDate;
  const isMatured = isLoan && maturityDate <= today;

  // Check if due date is approaching or passed (irrelevant once a loan has matured)
  const isOverdue = !isPaid && !isMatured && dueDate < today;

  const monthsRemaining = isLoan && !isMatured
    ? monthsBetween(new Date(), new Date(maturityDate))
    : null;

  const statusLabel = isMatured
    ? '✓ Loan Completed'
    : isPaid
    ? '✓ Paid'
    : isOverdue
    ? '⚠️ Overdue'
    : '⏳ Pending';

  const statusColor = isMatured || isPaid ? '#10B981' : isOverdue ? '#F59E0B' : '#F59E0B';
  const statusBg = isMatured || isPaid ? '#064E3B' : '#78350F';

  return (
    <View style={[styles.card, isOverdue && styles.cardOverdue]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.dueDate}>Due Date: {dueDate}</Text>
        {isLoan && (
          <Text style={styles.maturityText}>
            {isMatured
              ? '🏁 Loan matured'
              : `🏁 Ends ${formatMonthYear(maturityDate)} • ${monthsRemaining} mo left`}
          </Text>
        )}
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>₹{Number(amount || 0).toFixed(2)}</Text>
        {isMatured ? (
          <Text style={[styles.statusBadge, { color: statusColor, backgroundColor: statusBg }]}>
            {statusLabel}
          </Text>
        ) : (
          <TouchableOpacity onPress={onTogglePaid}>
            <Text style={[styles.statusBadge, { color: statusColor, backgroundColor: statusBg }]}>
              {statusLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
