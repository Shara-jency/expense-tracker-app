import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getDashboardStyles } from '../styles/dashboardStyles';
import MandatoryCard from '../components/MandatoryCard';
import { deleteDoc, doc } from 'firebase/firestore';

export default function DashboardScreen({ navigation }) {
  const { theme, colors } = useTheme();
  const styles = getDashboardStyles(theme);

  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (!user) return;

    // 1. Listen for regular expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setExpenses(expList);
      setLoading(false);
    });

    // 2. Listen for mandatory bills
    const billsQuery = query(
      collection(db, 'mandatory_expenses'),
      where('userId', '==', user.uid),
      orderBy('dueDate', 'asc')
    );

    const unsubscribeBills = onSnapshot(billsQuery, (snapshot) => {
      const billList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setBills(billList);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeBills();
    };
  }, [user]);

  const toggleBillPaidStatus = async (billId, currentStatus) => {
    try {
      const billRef = doc(db, 'mandatory_expenses', billId);
      await updateDoc(billRef, { isPaid: !currentStatus });
    } catch (e) {
      console.error('Error toggling status:', e);
    }
  };

  import { deleteDoc, doc } from 'firebase/firestore';

  // Add inside DashboardScreen:
  const handleDeleteExpense = (id, title) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'expenses', id));
            } catch (e) {
              Alert.alert('Error', 'Could not delete item: ' + e.message);
            }
          },
        },
      ]
    );
  };

  const totalSpent = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalMandatory = bills
    .filter((b) => !b.isPaid)
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.userEmailText}>{userName}</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={{ flexDirection: 'row', gap: 10, marginVertical: 15 }}>
        <View style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>₹{totalSpent.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { flex: 1, borderColor: '#F59E0B' }]}>
          <Text style={styles.summaryLabel}>Pending Bills</Text>
          <Text style={[styles.summaryAmount, { color: '#F59E0B' }]}>
            ₹{totalMandatory.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Upcoming Bills & Liabilities */}
      {bills.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Upcoming Bills & Liabilities</Text>
          {bills.map((bill) => (
            <MandatoryCard
              key={bill.id}
              title={bill.title}
              amount={bill.amount}
              dueDate={bill.dueDate}
              isPaid={bill.isPaid}
              onTogglePaid={() => toggleBillPaidStatus(bill.id, bill.isPaid)}
              theme={theme}
            />
          ))}
        </View>
      )}

      {/* Recent Expenses List */}
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
      </View>

      {expenses.length === 0 ? (
        <Text style={styles.emptyText}>No expenses logged yet.</Text>
      ) : (
        expenses.map((item) => (
          <View key={item.id} style={styles.expenseItem}>
            <View>
              <Text style={styles.expenseTitle}>{item.title}</Text>
              <Text style={styles.expenseCategory}>{item.category}</Text>
            </View>
            <Text style={styles.expenseAmount}>-₹{item.amount.toFixed(2)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}