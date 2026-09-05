import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAnalyticsStyles } from '../styles/analyticsStyles';
import BudgetProgressBar from '../components/BudgetProgressBar';
import LeakCard from '../components/LeakCard';
import { detectFinancialLeaks } from '../services/leakDetector';

// Default budget limits per month in INR
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
  const [categorySpends, setCategorySpends] = useState({});
  const [leaks, setLeaks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Calculate totals per category
      const catMap = {};
      expList.forEach((item) => {
        const cat = item.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + (Number(item.amount) || 0);
      });

      setExpenses(expList);
      setCategorySpends(catMap);

      // Run Leak Detector
      const detectedLeaks = detectFinancialLeaks(expList);
      setLeaks(detectedLeaks);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.headerTitle}>Phase 1: Leak Lens & Alerts</Text>

      {/* 1. Leak Detector Section */}
      <Text style={styles.sectionTitle}>Detected Leaks & Habit Drains</Text>
      {leaks.length === 0 ? (
        <View style={styles.chartCard}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            🎉 Great discipline! No recurring spending leaks detected in the last 30 days.
          </Text>
        </View>
      ) : (
        leaks.map((leak, idx) => (
          <LeakCard key={idx} leak={leak} theme={theme} />
        ))
      )}

      {/* 2. Category Budget Progress Bars */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Monthly Category Caps</Text>
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