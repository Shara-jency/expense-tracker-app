import { getLiabilityStatus } from './liabilityService';

/**
 * Processes raw expenses and mandatory liabilities into monthly trend data
 * and commitment ratio figures.
 */
export const processAnalyticsData = (expenses = [], mandatoryExpenses = [], monthlyIncome = 0) => {
  let totalFixed = 0;
  let totalDiscretionary = 0;

  // 1. Calculate Fixed Obligations (excluding loans that have already matured)
  mandatoryExpenses.forEach((bill) => {
    if (getLiabilityStatus(bill) === 'matured') return;
    totalFixed += Number(bill.amount) || 0;
  });

  // 2. Calculate Discretionary Spends & Group by Month
  const monthlyTotals = {};

  // Initialize last 4 months (e.g., Jun, Jul, Aug, Sep)
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toLocaleString('en-US', { month: 'short' });
    monthlyTotals[monthKey] = 0;
  }

  expenses.forEach((item) => {
    const amount = Number(item.amount) || 0;
    totalDiscretionary += amount;

    // Parse date safely
    let itemDate = new Date();
    if (item.createdAt?.toDate) {
      itemDate = item.createdAt.toDate();
    } else if (item.createdAt) {
      itemDate = new Date(item.createdAt);
    }

    const monthKey = itemDate.toLocaleString('en-US', { month: 'short' });
    if (monthlyTotals[monthKey] !== undefined) {
      monthlyTotals[monthKey] += amount;
    }
  });

  // Calculate Remaining/Savings
  const totalSpent = totalFixed + totalDiscretionary;
  const remainingIncome = Math.max(0, monthlyIncome - totalSpent);

  return {
    totalFixed,
    totalDiscretionary,
    remainingIncome,
    monthlyTrend: {
      labels: Object.keys(monthlyTotals),
      datasets: [
        {
          data: Object.values(monthlyTotals).map((val) => Math.round(val)),
        },
      ],
    },
  };
};

/**
 * Builds a payoff summary for every Loan EMI liability that has a
 * maturity/end date set, sorted by soonest-to-finish first.
 */
export const getActiveLoanSummaries = (mandatoryExpenses = []) => {
  const now = new Date();

  return mandatoryExpenses
    .filter((bill) => bill.category === 'Loan EMI' && bill.maturityDate)
    .map((bill) => {
      const maturity = new Date(bill.maturityDate);
      const monthlyAmount = Number(bill.amount) || 0;
      const isMatured = maturity <= now;

      const monthsRemaining = isMatured
        ? 0
        : Math.max(
            0,
            (maturity.getFullYear() - now.getFullYear()) * 12 +
              (maturity.getMonth() - now.getMonth())
          );

      return {
        id: bill.id,
        title: bill.title,
        monthlyAmount,
        maturityDate: bill.maturityDate,
        monthsRemaining,
        isMatured,
        projectedRemainingPayout: monthlyAmount * monthsRemaining,
      };
    })
    .sort((a, b) => a.monthsRemaining - b.monthsRemaining);
};