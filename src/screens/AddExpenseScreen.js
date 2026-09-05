import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAddExpenseStyles } from '../styles/addExpenseStyles';

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Transport',
  'Subscriptions',
  'Groceries',
  'Other',
];

const FIXED_BILL_CATEGORIES = [
  'Credit Card Bill',
  'Loan EMI',
  'House Rent',
  'Utilities',
  'Insurance',
  'Other Bill',
];

export default function AddExpenseScreen({ navigation }) {
  const { theme, colors } = useTheme();
  const styles = getAddExpenseStyles(theme);

  // Toggle state: 'expense' vs 'bill'
  const [entryType, setEntryType] = useState('expense');

  // Common Fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [notes, setNotes] = useState('');

  // Fixed Bill specific field
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [loading, setLoading] = useState(false);

  const handleEntryTypeChange = (type) => {
    setEntryType(type);
    setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : FIXED_BILL_CATEGORIES[0]);
  };

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Validation Error', 'Please fill in Title and Amount.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount.');
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User unauthenticated.');
      return;
    }

    setLoading(true);

    try {
      if (entryType === 'expense') {
        await addDoc(collection(db, 'expenses'), {
          userId,
          title: title.trim(),
          amount: parsedAmount,
          category,
          notes: notes.trim(),
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Expense recorded successfully!');
      } else {
        await addDoc(collection(db, 'mandatory_expenses'), {
          userId,
          title: title.trim(),
          amount: parsedAmount,
          category,
          dueDate: dueDate.trim(),
          isPaid: false,
          notes: notes.trim(),
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Fixed Liability / Bill added successfully!');
      }

      // Reset form
      setTitle('');
      setAmount('');
      setNotes('');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = entryType === 'expense' ? EXPENSE_CATEGORIES : FIXED_BILL_CATEGORIES;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.headerTitle}>Add New Record</Text>

      {/* Entry Type Selector */}
      <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: colors.cardBackground, borderRadius: 10, padding: 4 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: entryType === 'expense' ? colors.accent : 'transparent',
          }}
          onPress={() => handleEntryTypeChange('expense')}
        >
          <Text style={{ color: entryType === 'expense' ? '#FFFFFF' : colors.textSecondary, fontWeight: 'bold' }}>
            Daily Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: entryType === 'bill' ? colors.accent : 'transparent',
          }}
          onPress={() => handleEntryTypeChange('bill')}
        >
          <Text style={{ color: entryType === 'bill' ? '#FFFFFF' : colors.textSecondary, fontWeight: 'bold' }}>
            Fixed Bill / Debt
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder={entryType === 'expense' ? 'e.g., Starbucks Coffee' : 'e.g., HDFC Credit Card Bill'}
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      {entryType === 'bill' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>
      )}

      {/* Category Pills */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginVertical: 8 }}>
          {currentCategories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Additional notes..."
          placeholderTextColor={colors.textSecondary}
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>
            {entryType === 'expense' ? 'Save Expense' : 'Save Fixed Liability'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}