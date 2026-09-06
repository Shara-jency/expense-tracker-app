import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import InlineLoader from '../components/InlineLoader';
import { exportExpensesToCSV } from '../services/exportService';
import {
  requestNotificationPermissions,
  scheduleBillReminder,
  cancelBillReminder,
  scheduleWeeklyLoggingReminder,
  isWeeklyReminderEnabled,
} from '../services/notificationService';
import { EXPENSE_CATEGORIES } from '../constants/categories';

const CATEGORIES = ['All', ...EXPENSE_CATEGORIES];

const CATEGORY_ICONS = {
  'Food & Dining': 'restaurant-outline',
  'Shopping': 'bag-handle-outline',
  'Entertainment': 'film-outline',
  'Transport': 'car-outline',
  'Subscriptions': 'repeat-outline',
  'Groceries': 'cart-outline',
  'Other': 'ellipsis-horizontal-outline',
};

const CATEGORY_COLORS = {
  'Food & Dining': '#F59E0B',
  'Shopping': '#EC4899',
  'Entertainment': '#8B5CF6',
  'Transport': '#0EA5E9',
  'Subscriptions': '#6366F1',
  'Groceries': '#10B981',
  'Other': '#6B7280',
};

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

    // Schedule the weekly expense logging check-in (Saturdays at 9 AM),
    // unless the user has turned it off from Profile & Settings.
    isWeeklyReminderEnabled().then((enabled) => {
      if (!enabled) return;
      requestNotificationPermissions().then((granted) => {
        if (granted) {
          scheduleWeeklyLoggingReminder(7, 9, 0); // Day 7 = Saturday, 9:00 AM
        }
      });
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

      // Schedule notification reminders for pending bills,
      // and cancel any reminder for bills that are now paid.
      billList.forEach((bill) => {
        if (!bill.isPaid && bill.dueDate) {
          scheduleBillReminder(bill.id, bill.title, bill.amount, bill.dueDate);
        } else if (bill.isPaid) {
          cancelBillReminder(bill.id);
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
        <InlineLoader
          size="large"
          color={colors.accent}
          textColor={colors.textSecondary}
          text="Loading your expenses..."
        />
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
            <Ionicons name="download-outline" size={14} color="#FFF" />
            <Text style={localStyles.exportBtnText}>CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
          <View style={[styles.summaryCard, { flex: 1 }]}>
            <View style={[styles.summaryIconWrap, { backgroundColor: `${colors.accent}26` }]}>
              <Ionicons name="wallet-outline" size={16} color={colors.accent} />
            </View>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryAmount}>₹{totalSpent.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { flex: 1, borderColor: '#F59E0B' }]}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#F59E0B26' }]}>
              <Ionicons name="calendar-outline" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.summaryLabel}>Pending Bills</Text>
            <Text style={[styles.summaryAmount, { color: '#F59E0B' }]}>₹{totalMandatory.toFixed(2)}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={localStyles.searchBarWrap}>
          <Ionicons name="search-outline" size={16} color={colors.textSecondary} style={localStyles.searchIcon} />
          <TextInput
            style={[localStyles.searchBar, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.border }]}
            placeholder="Search expenses or merchants..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

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
                      backgroundColor: isSelected ? colors.accent : colors.cardBackground,
                      borderColor: isSelected ? colors.accent : colors.border,
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
                category={bill.category}
                maturityDate={bill.maturityDate}
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
          filteredExpenses.map((item) => {
            const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
            const categoryIcon = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other;

            return (
              <View key={item.id} style={styles.expenseItem}>
                <View style={[styles.categoryIconWrap, { backgroundColor: `${categoryColor}26` }]}>
                  <Ionicons name={categoryIcon} size={18} color={categoryColor} />
                </View>

                <View style={styles.expenseDetails}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.expenseTitle} numberOfLines={1}>{item.title}</Text>
                    {item.receiptUri && (
                      <Image source={{ uri: item.receiptUri }} style={localStyles.receiptThumb} />
                    )}
                  </View>
                  <Text style={styles.expenseCategory} numberOfLines={1}>
                    {item.category || 'Other'} • {formatDate(item.expenseDate || item.createdAt)}
                  </Text>
                </View>

                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>-₹{(item.amount || 0).toFixed(2)}</Text>
                  <View style={styles.expenseActions}>
                    <TouchableOpacity
                      onPress={() => handleEditExpense(item)}
                      style={styles.iconButton}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      accessibilityLabel={`Edit ${item.title}`}
                    >
                      <Ionicons name="create-outline" size={15} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteExpense(item.id, item.title)}
                      style={styles.iconButton}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      accessibilityLabel={`Delete ${item.title}`}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  searchBarWrap: {
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 36,
    paddingRight: 12,
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