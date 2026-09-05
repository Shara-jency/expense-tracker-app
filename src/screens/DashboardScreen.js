import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getDashboardStyles } from '../styles/dashboardStyles';
import MandatoryCard from '../components/MandatoryCard';
import EditExpenseModal from '../components/EditExpenseModal';
import GlobalFAB from '../components/GlobalFAB';
import { exportExpensesToCSV } from '../services/exportService';
import {
  requestNotificationPermissions,
  scheduleBillReminder,
  scheduleWeeklyLoggingReminder,
} from '../services/notificationService';

const CATEGORIES = ['All', 'Food & Dining', 'Shopping', 'Entertainment', 'Transport', 'Groceries', 'Bills'];

export default function DashboardScreen({ navigation }) {
  const { theme, colors } = useTheme();
  const styles = getDashboardStyles(theme);

  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [editingExpense, setEditingExpense] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (!user) return;

    // Request notification access & schedule weekly expense logging check-in (Saturdays at 9 AM)
    requestNotificationPermissions().then((granted) => {
      if (granted) {
        scheduleWeeklyLoggingReminder(7, 9, 0); // Day 7 = Saturday, 9:00 AM
      }
    });

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

    // 2. Listen for mandatory bills & schedule reminders for unpaid ones
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

      // Schedule notification reminders for pending bills
      billList.forEach((bill) => {
        if (!bill.isPaid && bill.dueDate) {
          scheduleBillReminder(bill.title, bill.amount, bill.dueDate);
        }
      });
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

  const handleDeleteExpense = (id, title) => {
    Alert.alert('Delete Record', `Are you sure you want to delete "${title}"?`, [
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
    ]);
  };

  const handleEditExpense = (item) => {
    setEditingExpense(item);
    setIsEditModalOpen(true);
  };

  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalMandatory = bills
    .filter((b) => !b.isPaid)
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  const formatDate = (rawDate) => {
    if (!rawDate) return '';
    const dateObj = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
    return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header & CSV Export */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }}>
          <View>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userEmailText}>{userName}</Text>
          </View>

          <TouchableOpacity style={localStyles.exportBtn} onPress={() => exportExpensesToCSV(expenses, bills)}>
            <Text style={localStyles.exportBtnText}>📄 CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
          <View style={[styles.summaryCard, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryAmount}>₹{totalSpent.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { flex: 1, borderColor: '#F59E0B' }]}>
            <Text style={styles.summaryLabel}>Pending Bills</Text>
            <Text style={[styles.summaryAmount, { color: '#F59E0B' }]}>₹{totalMandatory.toFixed(2)}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <TextInput
          style={[localStyles.searchBar, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="🔍 Search expenses or merchants..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Category Filter Pills */}
        <View style={{ height: 40, marginBottom: 15 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    localStyles.filterPill,
                    {
                      backgroundColor: isSelected ? '#3B82F6' : colors.cardBackground,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: isSelected ? '#FFF' : colors.textSecondary, fontWeight: '600', fontSize: 12 }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Upcoming Bills & Liabilities */}
        {bills.length > 0 && selectedCategory === 'All' && !searchQuery && (
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
          <Text style={styles.sectionTitle}>
            {searchQuery || selectedCategory !== 'All' ? 'Filtered Expenses' : 'Recent Expenses'}
          </Text>
        </View>

        {filteredExpenses.length === 0 ? (
          <Text style={styles.emptyText}>No matching expenses found.</Text>
        ) : (
          filteredExpenses.map((item) => (
            <View key={item.id} style={styles.expenseItem}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.expenseTitle}>{item.title}</Text>
                  {item.receiptUri && (
                    <Image source={{ uri: item.receiptUri }} style={localStyles.receiptThumb} />
                  )}
                </View>
                <Text style={styles.expenseCategory}>
                  {item.category || 'Other'} • {formatDate(item.expenseDate || item.createdAt)}
                </Text>
              </View>

              <Text style={styles.expenseAmount}>-₹{(item.amount || 0).toFixed(2)}</Text>

              <View style={{ flexDirection: 'row', gap: 8, marginLeft: 10 }}>
                <TouchableOpacity onPress={() => handleEditExpense(item)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 14 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteExpense(item.id, item.title)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 14 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Edit Modal */}
        <EditExpenseModal
          visible={isEditModalOpen}
          expense={editingExpense}
          onClose={() => setIsEditModalOpen(false)}
          theme={theme}
        />
      </ScrollView>

      {/* Global Quick Add Floating Action Button */}
      <GlobalFAB theme={theme} />
    </View>
  );
}

const localStyles = StyleSheet.create({
  exportBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  receiptThumb: {
    width: 18,
    height: 18,
    borderRadius: 3,
  },
});