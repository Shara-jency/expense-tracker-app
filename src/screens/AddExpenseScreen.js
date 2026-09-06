import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAddExpenseStyles } from '../styles/addExpenseStyles';
import { EXPENSE_CATEGORIES, FIXED_BILL_CATEGORIES } from '../constants/categories';

// Safe conditional import so a missing/unlinked native module doesn't crash the app
// (matches the pattern used in QuickAddModal.js).
let DateTimePicker;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  DateTimePicker = null;
}

const formatDate = (date) =>
  date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

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

  // Fixed Bill specific fields
  const [dueDate, setDueDate] = useState(new Date());
  const [showDuePicker, setShowDuePicker] = useState(false);

  // Loan EMI specific field: when the loan is fully repaid
  const [maturityDate, setMaturityDate] = useState(null);
  const [showMaturityPicker, setShowMaturityPicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const isLoanEmi = entryType === 'bill' && category === 'Loan EMI';

  const handleEntryTypeChange = (type) => {
    setEntryType(type);
    setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : FIXED_BILL_CATEGORIES[0]);
    setMaturityDate(null);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat !== 'Loan EMI') {
      setMaturityDate(null);
    }
  };

  const handleDuePickerPress = () => {
    if (!DateTimePicker) {
      Alert.alert(
        'Date Picker Unavailable',
        "This build can't open the native date picker. Today's date will be used."
      );
      return;
    }
    setShowDuePicker(true);
  };

  const handleMaturityPickerPress = () => {
    if (!DateTimePicker) {
      Alert.alert(
        'Date Picker Unavailable',
        "This build can't open the native date picker."
      );
      return;
    }
    setShowMaturityPicker(true);
  };

  const handleDueDateChange = (event, selectedDate) => {
    setShowDuePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleMaturityDateChange = (event, selectedDate) => {
    setShowMaturityPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMaturityDate(selectedDate);
    }
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

    if (isLoanEmi && !maturityDate) {
      Alert.alert('Validation Error', 'Please select the loan maturity / end date.');
      return;
    }

    if (isLoanEmi && maturityDate <= new Date()) {
      Alert.alert('Validation Error', 'Loan maturity date must be in the future.');
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
          dueDate: dueDate.toISOString().split('T')[0],
          maturityDate: isLoanEmi ? maturityDate.toISOString().split('T')[0] : null,
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
      setDueDate(new Date());
      setMaturityDate(null);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save record: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = entryType === 'expense' ? EXPENSE_CATEGORIES : FIXED_BILL_CATEGORIES;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={handleDuePickerPress}>
            <Text style={styles.dateButtonText}>📅 {formatDate(dueDate)}</Text>
          </TouchableOpacity>
          {showDuePicker && DateTimePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={handleDueDateChange}
            />
          )}
        </View>
      )}

      {isLoanEmi && (
        <View style={styles.formGroup}>
          <View style={styles.loanInfoBanner}>
            <Text style={styles.loanInfoText}>
              🏁 The maturity date lets Analytics estimate your remaining EMI payout and flag the loan as
              complete once it's fully repaid.
            </Text>
          </View>

          <Text style={styles.label}>Loan Maturity / End Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={handleMaturityPickerPress}>
            <Text style={maturityDate ? styles.dateButtonText : styles.dateButtonPlaceholder}>
              🏁 {maturityDate ? formatDate(maturityDate) : 'Select the loan end date'}
            </Text>
          </TouchableOpacity>
          {showMaturityPicker && DateTimePicker && (
            <DateTimePicker
              value={maturityDate || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleMaturityDateChange}
            />
          )}
        </View>
      )}

      {/* Category Pills */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginVertical: 8 }}>
          {currentCategories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => handleCategoryChange(cat)}
              style={[
                styles.categoryChip,
                category === cat && styles.selectedCategoryChip,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.selectedCategoryChipText,
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
    </KeyboardAvoidingView>
  );
}
