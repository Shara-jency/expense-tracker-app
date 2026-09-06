/**
 * Classifies a fixed liability (mandatory_expenses doc) into a single status:
 *
 * - 'matured'  — a Loan EMI whose maturity date has passed. Fully repaid.
 * - 'paid'     — marked paid by the user.
 * - 'overdue'  — unpaid and the due date has already passed.
 * - 'pending'  — unpaid and due within the current calendar month.
 * - 'upcoming' — unpaid and due in a future month. Not yet actionable.
 */
export const getLiabilityStatus = (bill) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const isLoan = bill.category === 'Loan EMI' && !!bill.maturityDate;
  if (isLoan && bill.maturityDate <= todayStr) return 'matured';

  if (bill.isPaid) return 'paid';

  if (!bill.dueDate) return 'pending';
  if (bill.dueDate < todayStr) return 'overdue';

  const due = new Date(bill.dueDate);
  const dueThisMonth =
    due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();

  return dueThisMonth ? 'pending' : 'upcoming';
};

/**
 * Summarizes fixed liabilities for the current month: how much is due in
 * total, how much of that has been paid, and how much is still pending or
 * overdue. Bills scheduled for a future month are tracked separately and
 * excluded from "this month's" totals so they don't inflate what's actually
 * due right now.
 */
export const summarizeLiabilities = (bills = []) => {
  let totalMonthly = 0;
  let paidThisMonth = 0;
  let pendingThisMonth = 0;
  let overdueThisMonth = 0;
  let upcomingTotal = 0;
  let upcomingCount = 0;

  bills.forEach((bill) => {
    const amount = Number(bill.amount) || 0;
    const status = getLiabilityStatus(bill);

    switch (status) {
      case 'matured':
        break; // fully repaid loan, no longer a fixed obligation
      case 'paid':
        paidThisMonth += amount;
        totalMonthly += amount;
        break;
      case 'overdue':
        overdueThisMonth += amount;
        totalMonthly += amount;
        break;
      case 'pending':
        pendingThisMonth += amount;
        totalMonthly += amount;
        break;
      case 'upcoming':
        upcomingTotal += amount;
        upcomingCount += 1;
        break;
      default:
        break;
    }
  });

  return {
    totalMonthly,
    paidThisMonth,
    pendingThisMonth,
    overdueThisMonth,
    upcomingTotal,
    upcomingCount,
  };
};
