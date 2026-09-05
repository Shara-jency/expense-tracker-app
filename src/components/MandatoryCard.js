import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getMandatoryStyles } from '../styles/mandatoryStyles';

export default function MandatoryCard({ title, amount, dueDate, isPaid, onTogglePaid, theme = 'dark' }) {
  const styles = getMandatoryStyles(theme);

  // Check if due date is approaching or passed
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = !isPaid && dueDate < today;

  return (
    <View style={[styles.card, isOverdue && styles.cardOverdue]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.dueDate}>Due Date: {dueDate}</Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>₹{amount.toFixed(2)}</Text>
        <TouchableOpacity onPress={onTogglePaid}>
          <Text style={[
            styles.statusBadge, 
            { color: isPaid ? '#10B981' : '#F59E0B', backgroundColor: isPaid ? '#064E3B' : '#78350F' }
          ]}>
            {isPaid ? '✓ Paid' : isOverdue ? '⚠️ Overdue' : '⏳ Pending'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}