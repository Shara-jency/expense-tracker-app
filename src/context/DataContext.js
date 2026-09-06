import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  requestNotificationPermissions,
  scheduleBillReminder,
  cancelBillReminder,
  scheduleWeeklyLoggingReminder,
  isWeeklyReminderEnabled,
} from '../services/notificationService';

const DataContext = createContext();

// Expenses are fetched once for a rolling 6-month window — comfortably
// more than the 30-day leak-detection window and the 4-month trend chart
// need, while still bounding the query instead of loading a user's entire
// lifetime history on every snapshot update.
const ANALYTICS_LOOKBACK_MONTHS = 6;
const RECENT_EXPENSES_PAGE_SIZE = 50;

/**
 * Single source of truth for a signed-in user's expenses, fixed
 * liabilities, and saved monthly income.
 *
 * Previously each screen (Home, Dashboard, Analytics, Profile) ran its own
 * onSnapshot listeners against the same collections, so every tab
 * multiplied Firestore reads for identical data. Centralizing the
 * subscriptions here means the data is fetched once per login and shared.
 *
 * It also owns the bill-reminder and weekly-reminder scheduling side
 * effects, which previously lived inside DashboardScreen and therefore
 * never ran until the user visited that tab (React Navigation's bottom-tab
 * screens mount lazily on first focus).
 */
export const DataProvider = ({ uid, children }) => {
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  // Purely client-side "page size" for how many already-fetched expenses
  // a screen renders at once — does not trigger another Firestore read.
  const [visibleExpenseCount, setVisibleExpenseCount] = useState(RECENT_EXPENSES_PAGE_SIZE);

  useEffect(() => {
    setVisibleExpenseCount(RECENT_EXPENSES_PAGE_SIZE);
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setExpenses([]);
      setBills([]);
      setMonthlyIncome(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    const lookbackStart = new Date();
    lookbackStart.setMonth(lookbackStart.getMonth() - ANALYTICS_LOOKBACK_MONTHS);

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', uid),
      where('createdAt', '>=', lookbackStart),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      setExpenses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const billsQuery = query(
      collection(db, 'mandatory_expenses'),
      where('userId', '==', uid),
      orderBy('dueDate', 'asc')
    );

    const unsubscribeBills = onSnapshot(billsQuery, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBills(list);

      // Keep bill reminders in sync with the latest data no matter which
      // tab is currently focused.
      list.forEach((bill) => {
        if (!bill.isPaid && bill.dueDate) {
          scheduleBillReminder(bill.id, bill.title, bill.amount, bill.dueDate);
        } else if (bill.isPaid) {
          cancelBillReminder(bill.id);
        }
      });
    });

    const unsubscribeIncome = onSnapshot(doc(db, 'users', uid), (snapshot) => {
      const value = Number(snapshot.data()?.monthlyIncome);
      setMonthlyIncome(Number.isFinite(value) ? value : 0);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeBills();
      unsubscribeIncome();
    };
  }, [uid]);

  // Bootstrap the weekly logging reminder once per login.
  useEffect(() => {
    if (!uid) return;

    isWeeklyReminderEnabled().then((enabled) => {
      if (!enabled) return;
      requestNotificationPermissions().then((granted) => {
        if (granted) {
          scheduleWeeklyLoggingReminder(7, 9, 0); // Day 7 = Saturday, 9:00 AM
        }
      });
    });
  }, [uid]);

  const hasMoreExpenses = visibleExpenseCount < expenses.length;
  const showMoreExpenses = () => setVisibleExpenseCount((n) => n + RECENT_EXPENSES_PAGE_SIZE);

  return (
    <DataContext.Provider
      value={{
        expenses,
        bills,
        monthlyIncome,
        loading,
        visibleExpenseCount,
        hasMoreExpenses,
        showMoreExpenses,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
