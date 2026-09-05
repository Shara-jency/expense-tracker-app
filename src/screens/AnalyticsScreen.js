import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAnalyticsStyles } from '../styles/analyticsStyles';
import BudgetProgressBar from '../components/BudgetProgressBar';

const screenWidth = Dimensions.get('window').width - 32;

// Default category budget thresholds (can be made user-configurable)
const DEFAULT_BUDGETS = {
  'Food & Dining': 8000,
  'Shopping': 6000,
  'Entertainment': 4000,
  'Transport': 3000,
  'Subscriptions': 2000,
  'Groceries': 10000,
};

export default function AnalyticsScreen() {
  const { theme, colors } = useTheme();
  const styles = getAnalyticsStyles(theme);

  const [loading, setLoading] = useState(true);
  const [totalFixed, setTotalFixed] = useState(0);
  const [totalDiscretionary, setTotalDiscretionary] = useState(0);
  const [categorySpends, setCategorySpends] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Fetch Discretionary Expenses
    const qExpenses = query(collection(db, 'expenses'), where('userId', '==', user.uid));
    const unsubscribeExp = onSnapshot(qExpenses, (snapshot) => {
      let discTotal = 0;
      const catMap = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const amt = data.amount || 0;
        const cat = data.category || 'Other';

        discTotal += amt;
        catMap[cat] = (catMap[cat] || 0) + amt;
      });

      setTotalDiscretionary(discTotal);
      setCategorySpends(catMap);
      setLoading(false);
    });

    // 2. Fetch Fixed Bills & Obligations
    const qBills = query(collection(db, 'mandatory_expenses'), where('userId', '==', user.uid));
    const unsubscribeBills = onSnapshot(qBills, (snapshot) => {
      let fixedSum = 0;
      snapshot.forEach((doc) => {
        fixedSum += doc.data().amount || 0;
      });
      setTotalFixed(fixedSum);
    });

    return () => {
      unsubscribeExp();
      unsubscribeBills();
    };
  }, []);

  const pieData = [
    {
      name: 'Fixed Bills',
      population: totalFixed,
      color: '#EF4444',
      legendFontColor: colors.textPrimary,
      legendFontSize: 12,
    },
    {
      name: 'Discretionary',
      population: totalDiscretionary,
      color: '#3B82F6',
      legendFontColor: colors.textPrimary,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => colors.textSecondary,
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.headerTitle}>Analytics & Budget Lens</Text>

      {/* Fixed vs Discretionary Chart */}
      <Text style={styles.sectionTitle}>Fixed Commitments vs. Flexible Spend</Text>
      <View style={styles.chartCard}>
        {totalFixed > 0 || totalDiscretionary > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={styles.emptyText}>Log expenses or bills to see cash-flow distribution.</Text>
        )}
      </View>

      {/* Budget Limit Progress Bars */}
      <Text style={styles.sectionTitle}>Category Budget Limits</Text>
      {Object.keys(DEFAULT_BUDGETS).map((cat) => {
        const spent = categorySpends[cat] || 0;
        const limit = DEFAULT_BUDGETS[cat];

        return (
          <BudgetProgressBar
            key={cat}
            category={cat}
            spent={spent}
            limit={limit}
            theme={theme}
          />
        );
      })}
    </ScrollView>
  );
}