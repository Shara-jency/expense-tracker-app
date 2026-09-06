import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getHomeStyles } from '../styles/homeStyles';
import InlineLoader from '../components/InlineLoader';
import { summarizeLiabilities } from '../services/liabilityService';
import { detectFinancialLeaks } from '../services/leakDetector';

export default function HomeScreen({ navigation }) {
  const { theme, colors } = useTheme();
  const styles = getHomeStyles(theme);

  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    if (!user) return;

    const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', user.uid));
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      setExpenses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const billsQuery = query(collection(db, 'mandatory_expenses'), where('userId', '==', user.uid));
    const unsubBills = onSnapshot(billsQuery, (snapshot) => {
      setBills(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubExpenses();
      unsubBills();
    };
  }, [user]);

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
      <Text style={styles.greeting}>Welcome back,</Text>
      <Text style={styles.userName}>{userName}</Text>

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
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
