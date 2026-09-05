import React from 'react';
import { View, Text } from 'react-native';
import { getGlobalStyles } from '../styles/globalStyles';

export default function TransactionRow({ title, category, amount, date, isLeak, theme = 'dark' }) {
  const styles = getGlobalStyles(theme);

  return (
    <View style={styles.transactionRow}>
      <View>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionMeta}>{category} • {date}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.transactionAmount}>-₹{amount.toFixed(2)}</Text>
        {isLeak && <Text style={styles.leakBadge}>Leak</Text>}
      </View>
    </View>
  );
}