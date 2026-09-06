import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAnalyticsStyles } from '../styles/analyticsStyles';
import BudgetProgressBar from '../components/BudgetProgressBar';
import LeakCard from '../components/LeakCard';
import LoanProgressCard from '../components/LoanProgressCard';
import InlineLoader from '../components/InlineLoader';
import { detectFinancialLeaks } from '../services/leakDetector';
import { processAnalyticsData, getActiveLoanSummaries } from '../services/analyticsService';

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
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen for the user's saved monthly income (set from Profile & Settings)
    const unsubIncome = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      const value = Number(snapshot.data()?.monthlyIncome);
      setMonthlyIncome(Number.isFinite(value) ? value : 0);
    });

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
      unsubIncome();
      unsubExp();
      unsubMandatory();
    };
  }, []);

  const processed = processAnalyticsData(expenses, mandatory, monthlyIncome);

  const loanSummaries = getActiveLoanSummaries(mandatory);
  const activeLoans = loanSummaries.filter((loan) => !loan.isMatured);
  const totalMonthlyEMI = activeLoans.reduce((sum, loan) => sum + loan.monthlyAmount, 0);
  const totalRemainingDebt = activeLoans.reduce((sum, loan) => sum + loan.projectedRemainingPayout, 0);

  const totalYearlyLeak = leaks.reduce((sum, leak) => sum + leak.projectedYearlyLeak, 0);

  const hasIncome = monthlyIncome > 0;

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
    ...(hasIncome
      ? [
          {
            name: 'Unspent / Buffer',
            population: processed.remainingIncome,
            color: '#10B981', // Green
            legendFontColor: colors.textPrimary,
            legendFontSize: 11,
          },
        ]
      : []),
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
        <InlineLoader
          size="large"
          color={colors.accent}
          textColor={colors.textSecondary}
          text="Crunching your analytics..."
        />
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

      {!hasIncome && (
        <View style={styles.incomeBanner}>
          <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
          <Text style={styles.incomeBannerText}>
            Set your monthly income in Profile & Settings to see your unspent buffer here.
          </Text>
        </View>
      )}

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
          <Text style={styles.emptyText}>
            🎉 Great discipline! No recurring spending leaks detected in the last 30 days.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.leakSummaryContainer}>
            <View style={styles.leakSummaryHeader}>
              <Text style={styles.leakSummaryTitle}>Total Projected Yearly Drain</Text>
              <Text style={styles.leakTotalText}>
                ₹{Math.round(totalYearlyLeak).toLocaleString('en-IN')}
              </Text>
            </View>
            <Text style={styles.leakDescription}>
              {leaks.length} recurring habit{leaks.length === 1 ? '' : 's'} detected in the last 30 days.
            </Text>
          </View>

          {leaks.map((leak, idx) => <LeakCard key={idx} leak={leak} theme={theme} />)}
        </>
      )}

      {/* 4. Active Loans & EMI Tracker */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Active Loans & EMIs</Text>
      {loanSummaries.length === 0 ? (
        <View style={styles.chartCard}>
          <Text style={styles.emptyText}>
            No loan EMIs tracked yet. Add one from "Fixed Bill / Debt" and set its maturity date.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.loanSummaryContainer}>
            <View style={styles.leakSummaryHeader}>
              <Text style={styles.loanSummaryTitle}>Total Remaining Debt</Text>
              <Text style={styles.leakTotalText}>
                ₹{Math.round(totalRemainingDebt).toLocaleString('en-IN')}
              </Text>
            </View>
            <Text style={styles.leakDescription}>
              ₹{totalMonthlyEMI.toLocaleString('en-IN')}/month across {activeLoans.length} active loan
              {activeLoans.length === 1 ? '' : 's'}.
            </Text>
          </View>

          {loanSummaries.map((loan) => (
            <LoanProgressCard key={loan.id} loan={loan} theme={theme} />
          ))}
        </>
      )}

      {/* 5. Budget Caps Progress Bars */}
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