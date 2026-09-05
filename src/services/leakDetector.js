/**
 * Analyzes discretionary expenses to identify high-frequency recurring leaks.
 * @param {Array} expenses - List of user expenses from Firestore
 * @returns {Array} List of detected leak insights
 */
export const detectFinancialLeaks = (expenses = []) => {
  if (!expenses.length) return [];

  // Group transactions by Title / Description (normalized lower-case)
  const frequencyMap = {};

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  expenses.forEach((item) => {
    // Only analyze last 30 days of data for active habits
    const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt || Date.now());
    if (itemDate < thirtyDaysAgo) return;

    const key = item.title.trim().toLowerCase();
    if (!frequencyMap[key]) {
      frequencyMap[key] = {
        originalTitle: item.title,
        count: 0,
        totalSpent: 0,
        category: item.category,
      };
    }

    frequencyMap[key].count += 1;
    frequencyMap[key].totalSpent += Number(item.amount) || 0;
  });

  const leaks = [];

  Object.keys(frequencyMap).forEach((key) => {
    const data = frequencyMap[key];
    
    // Leak Trigger Condition: Spent 4 or more times in 30 days on a non-fixed category
    if (data.count >= 4 && data.category !== 'Fixed Liability') {
      const avgCost = data.totalSpent / data.count;
      const projectedMonthly = (data.count / 30) * 30 * avgCost;
      const projectedYearly = projectedMonthly * 12;

      leaks.push({
        title: data.originalTitle,
        category: data.category,
        monthlyOccurrences: data.count,
        totalMonthlySpent: data.totalSpent,
        projectedYearlyLeak: projectedYearly,
        insightMessage: `Purchased ${data.count}x in the last 30 days. At this rate, this habit costs ₹${projectedYearly.toLocaleString('en-IN')}/year.`,
      });
    }
  });

  // Sort by highest yearly leak impact
  return leaks.sort((a, b) => b.projectedYearlyLeak - a.projectedYearlyLeak);
};