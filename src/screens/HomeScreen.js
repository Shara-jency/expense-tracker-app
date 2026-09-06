import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { usePrivacy } from '../context/PrivacyContext';
import { getHomeStyles } from '../styles/homeStyles';
import InlineLoader from '../components/InlineLoader';
import { summarizeLiabilities } from '../services/liabilityService';
import { detectFinancialLeaks } from '../services/leakDetector';

export default function HomeScreen({ navigation }) {
  const { theme, colors } = useTheme();
  const styles = getHomeStyles(theme);
  const { expenses, bills, loading } = useData();
  const { hideAmounts, toggleHideAmounts, maskAmount } = usePrivacy();

  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'there';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <InlineLoader
          size="large"
          color={colors.accent}
          textColor={colors.textSecondary}
          text="Preparing your overview..."
        />
      </View>
    );
  }

  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const liabilitySummary = summarizeLiabilities(bills);
  const leaks = detectFinancialLeaks(expenses);
  const totalRisk = leaks.reduce((sum, leak) => sum + leak.projectedYearlyLeak, 0);

  const cards = [
    {
      key: 'expenses',
      title: 'Expenses',
      value: `₹${totalExpenses.toFixed(2)}`,
      subtitle: `${expenses.length} logged`,
      icon: 'wallet-outline',
      color: colors.accent,
      target: 'Dashboard',
    },
    {
      key: 'pending',
      title: 'Pending Payment',
      value: `₹${(liabilitySummary.pendingThisMonth + liabilitySummary.overdueThisMonth).toFixed(2)}`,
      subtitle: 'Due this month',
      icon: 'alert-circle-outline',
      color: '#F59E0B',
      target: 'Dashboard',
    },
    {
      key: 'paid',
      title: 'Paid',
      value: `₹${liabilitySummary.paidThisMonth.toFixed(2)}`,
      subtitle: 'This month',
      icon: 'checkmark-circle-outline',
      color: '#10B981',
      target: 'Dashboard',
    },
    {
      key: 'planned',
      title: 'Planned',
      value: `₹${liabilitySummary.upcomingTotal.toFixed(2)}`,
      subtitle: `${liabilitySummary.upcomingCount} scheduled later`,
      icon: 'calendar-outline',
      color: '#6366F1',
      target: 'Dashboard',
    },
    {
      key: 'risk',
      title: 'Risk',
      value: `₹${Math.round(totalRisk).toLocaleString('en-IN')}`,
      subtitle: `${leaks.length} leak${leaks.length === 1 ? '' : 's'} detected`,
      icon: 'warning-outline',
      color: colors.danger,
      target: 'Analytics',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        <TouchableOpacity
          onPress={toggleHideAmounts}
          style={styles.privacyToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={hideAmounts ? 'Show amounts' : 'Hide amounts'}
        >
          <Ionicons name={hideAmounts ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardGrid}>
        {cards.map((card, index) => {
          const isLastOdd = index === cards.length - 1 && cards.length % 2 === 1;
          return (
            <TouchableOpacity
              key={card.key}
              style={[styles.card, isLastOdd && styles.cardFullWidth]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(card.target)}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${card.color}26` }]}>
                <Ionicons name={card.icon} size={20} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardValue}>{maskAmount(card.value)}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
