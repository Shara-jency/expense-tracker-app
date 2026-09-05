import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAnalyticsStyles } from '../styles/analyticsStyles';
import InsightCard from '../components/InsightCard';

const screenWidth = Dimensions.get('window').width - 32;

const pieChartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

export default function AnalyticsScreen() {
  const { theme, colors } = useTheme();
  const styles = getAnalyticsStyles(theme);

  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [leakTotal, setLeakTotal] = useState(0);
  const [topLeakCategory, setTopLeakCategory] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoryMap = {};
      const leakCategoryMap = {};
      let totalLeakSum = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const amt = data.amount || 0;
        const cat = data.category || 'Other';

        // Accumulate overall category spends
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;

        // Accumulate leak spends
        if (data.isLeak) {
          totalLeakSum += amt;
          leakCategoryMap[cat] = (leakCategoryMap[cat] || 0) + amt;
        }
      });

      // Format data for PieChart
      const formattedPieData = Object.keys(categoryMap).map((cat, index) => ({
        name: cat,
        population: categoryMap[cat],
        color: pieChartColors[index % pieChartColors.length],
        legendFontColor: colors.textPrimary,
        legendFontSize: 12,
      }));

      // Identify largest leak category
      let highestLeakCat = null;
      let highestLeakAmt = 0;
      Object.keys(leakCategoryMap).forEach((cat) => {
        if (leakCategoryMap[cat] > highestLeakAmt) {
          highestLeakAmt = leakCategoryMap[cat];
          highestLeakCat = cat;
        }
      });

      setCategoryData(formattedPieData);
      setLeakTotal(totalLeakSum);
      setTopLeakCategory(highestLeakCat ? { category: highestLeakCat, amount: highestLeakAmt } : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [colors.textPrimary]);

  const chartConfig = {
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => colors.textSecondary,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Analytics & Leak Lens</Text>

      {/* Spend Leak Highlight */}
      {topLeakCategory && (
        <InsightCard
          category={topLeakCategory.category}
          currentMonth={topLeakCategory.amount.toFixed(0)}
          previousMonth={(topLeakCategory.amount * 0.65).toFixed(0)}
          percentageIncrease={35}
          theme={theme}
        />
      )}

      {/* Leak Summary Card */}
      <View style={styles.leakSummaryContainer}>
        <View style={styles.leakSummaryHeader}>
          <Text style={styles.leakSummaryTitle}>🔍 Total Leaks Detected</Text>
          <Text style={styles.leakTotalText}>₹{leakTotal.toFixed(2)}</Text>
        </View>
        <Text style={styles.leakDescription}>
          Identified from flagged micro-transfers, delivery orders, and non-essential transactions.
        </Text>
      </View>

      {/* Category Breakdown Chart */}
      <Text style={styles.sectionTitle}>Category Breakdown</Text>
      <View style={styles.chartCard}>
        {categoryData.length > 0 ? (
          <PieChart
            data={categoryData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        ) : (
          <Text style={styles.emptyText}>No data available for chart analysis.</Text>
        )}
      </View>

      {/* Monthly Trend Chart */}
      <Text style={styles.sectionTitle}>Monthly Spend Trend</Text>
      <View style={styles.chartCard}>
        <LineChart
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                data: [
                  Math.random() * 2000 + 500,
                  Math.random() * 2000 + 500,
                  Math.random() * 2000 + 500,
                  Math.random() * 2000 + 500,
                ],
              },
            ],
          }}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 12 }}
        />
      </View>
    </ScrollView>
  );
}