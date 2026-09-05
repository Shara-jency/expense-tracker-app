import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAnalyticsStyles } from '../styles/analyticsStyles';
import BudgetProgressBar from '../components/BudgetProgressBar';
import LeakCard from '../components/LeakCard';
import { detectFinancialLeaks } from '../services/leakDetector';
import { processAnalyticsData } from '../services/analyticsService';

const screenWidth = Dimensions.get('window').width - 32;

const BUDGET_CAPS = {
  'Food & Dining': 6000,
  'Shopping': 5000,
  'Entertainment': 3000,
  'Transport': 2500,
  'Groceries': 8000,
};

export default function AnalyticsScreen() {
  const { theme, colors } = useTheme();
  const styles = getAnalyticsStyles(theme);

  const [expenses, setExpenses] = useState([]);
  const [mandatory, setMandatory] = useState([]);
  const [categorySpends, setCategorySpends] = useState({});
  const [leaks, setLeaks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Query Discretionary Expenses
    const qExp = query(collection(db, 'expenses'), where('userId', '==', user.uid));
    const unsubExp = onSnapshot(qExp, (snapshot) => {
      const expList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      const catMap = {};
      expList.forEach((item) => {
        const cat = item.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (Number(item.amount) || 0);
      });

      setExpenses(expList);
      setCategorySpends(catMap);
      setLeaks(detectFinancialLeaks(expList));
      setLoading(false);
    });

    // Query Fixed Obligations
    const qMandatory = query(collection(db, 'mandatory_expenses'), where('userId', '==', user.uid));
    const unsubMandatory = onSnapshot(qMandatory, (snapshot) => {
      const mandList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMandatory(mandList);
    });

    return () => {
      unsubExp();
      unsubMandatory();
    };
  }, []);

  const processed = processAnalyticsData(expenses, mandatory, 60000); // 60,000 assumed income base

  const pieData = [
    {
      name: 'Fixed Obligations',
      population: processed.totalFixed,
      color: '#EF4444', // Red
      legendFontColor: colors.textPrimary,
      legendFontSize: 11,
    },
    {
      name: 'Discretionary',
      population: processed.totalDiscretionary,
      color: '#3B82F6', // Blue
      legendFontColor: colors.textPrimary,
      legendFontSize: 11,
    },
    {
      name: 'Unspent / Buffer',
      population: processed.remainingIncome,
      color: '#10B981', // Green
      legendFontColor: colors.textPrimary,
      legendFontSize: 11,
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => colors.textSecondary,
    strokeWidth: 2,
    barPercentage: 0.6,
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.headerTitle}>Analytics & Intelligence</Text>

      {/* 1. Commitment Ratio Pie Chart */}
      <Text style={styles.sectionTitle}>Commitment Ratio Breakdown</Text>
      <View style={styles.chartCard}>
        <PieChart
          data={pieData}
          width={screenWidth}
          height={190}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
          absolute
        />
      </View>

      {/* 2. Monthly Spending Trend Bar Chart */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Monthly Discretionary Trend</Text>
      <View style={styles.chartCard}>
        <BarChart
          data={processed.monthlyTrend}
          width={screenWidth - 20}
          height={200}
          yAxisLabel="₹"
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars
          fromZero
        />
      </View>

      {/* 3. Leak Lens Section */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Detected Leaks & Habit Drains</Text>
      {leaks.length === 0 ? (
        <View style={styles.chartCard}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            🎉 Great discipline! No recurring spending leaks detected in the last 30 days.
          </Text>
        </View>
      ) : (
        leaks.map((leak, idx) => <LeakCard key={idx} leak={leak} theme={theme} />)
      )}

      {/* 4. Budget Caps Progress Bars */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Category Budget Limits</Text>
      {Object.keys(BUDGET_CAPS).map((category) => {
        const spent = categorySpends[category] || 0;
        const limit = BUDGET_CAPS[category];

        return (
          <BudgetProgressBar
            key={category}
            category={category}
            spent={spent}
            limit={limit}
            theme={theme}
          />
        );
      })}
    </ScrollView>
  );
}