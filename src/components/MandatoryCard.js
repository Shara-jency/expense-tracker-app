import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMandatoryStyles } from '../styles/mandatoryStyles';
import { colors } from '../styles/theme';
import { usePrivacy } from '../context/PrivacyContext';
import { getLiabilityStatus } from '../services/liabilityService';

const monthsBetween = (from, to) =>
  Math.max(0, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()));

const formatMonthYear = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

const STATUS_META = {
  matured: { label: '✓ Loan Completed', color: '#10B981', bg: '#064E3B' },
  paid: { label: '✓ Paid', color: '#10B981', bg: '#064E3B' },
  overdue: { label: '⚠️ Overdue', color: '#F59E0B', bg: '#78350F' },
  pending: { label: '⏳ Pending', color: '#F59E0B', bg: '#78350F' },
  upcoming: { label: '📅 Upcoming', color: '#60A5FA', bg: '#1E3A5F' },
};

export default function MandatoryCard({
  title,
  amount,
  dueDate,
  isPaid,
  category,
  maturityDate,
  isRecurring,
  lastPaidDate,
  onTogglePaid,
  onEdit,
  onDelete,
  theme = 'dark',
}) {
  const styles = getMandatoryStyles(theme);
  const currentColors = colors[theme] || colors.dark;
  const { maskAmount } = usePrivacy();

  const status = getLiabilityStatus({ category, maturityDate, isPaid, dueDate });
  const isLoan = category === 'Loan EMI' && !!maturityDate;
  const isMatured = status === 'matured';
  const isOverdue = status === 'overdue';

  const monthsRemaining = isLoan && !isMatured
    ? monthsBetween(new Date(), new Date(maturityDate))
    : null;

  const { label: statusLabel, color: statusColor, bg: statusBg } = STATUS_META[status];

  return (
    <View style={[styles.card, isOverdue && styles.cardOverdue]}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.title}>{title}</Text>
            {isRecurring && (
              <View style={styles.recurringBadge}>
                <Ionicons name="repeat" size={10} color={currentColors.accent} />
              </View>
            )}
          </View>
          <Text style={styles.dueDate}>
            {status === 'upcoming' ? 'Due (next month): ' : 'Due Date: '}
            {dueDate}
          </Text>
          {isLoan && (
            <Text style={styles.maturityText}>
              {isMatured
                ? '🏁 Loan matured'
                : `🏁 Ends ${formatMonthYear(maturityDate)} • ${monthsRemaining} mo left`}
            </Text>
          )}
          {!!lastPaidDate && (
            <Text style={styles.lastPaidText}>Last paid {formatMonthYear(lastPaidDate)}</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onEdit}
            style={styles.iconButton}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel={`Edit ${title}`}
          >
            <Ionicons name="create-outline" size={15} color={currentColors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={styles.iconButton}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel={`Delete ${title}`}
          >
            <Ionicons name="trash-outline" size={15} color={currentColors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.amount}>{maskAmount(`₹${Number(amount || 0).toFixed(2)}`)}</Text>
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
