import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, borderRadius, spacing } from '../styles/theme';
import { FIXED_BILL_CATEGORIES } from '../constants/categories';

// Safe conditional import so a missing/unlinked native module doesn't crash the app
// (matches the pattern used in AddExpenseScreen.js / QuickAddModal.js).
let DateTimePicker;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  DateTimePicker = null;
}

const formatDate = (date) =>
  date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const toDateOrNull = (dateStr) => (dateStr ? new Date(dateStr) : null);

export default function EditLiabilityModal({ visible, liability, onClose, theme = 'dark' }) {
  const currentColors = colors[theme] || colors.dark;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(FIXED_BILL_CATEGORIES[0]);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [maturityDate, setMaturityDate] = useState(null);
  const [showMaturityPicker, setShowMaturityPicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);
  const [saving, setSaving] = useState(false);

  const isLoanEmi = category === 'Loan EMI';

  useEffect(() => {
    if (liability) {
      setTitle(liability.title || '');
      setAmount(liability.amount ? String(liability.amount) : '');
      setCategory(liability.category || FIXED_BILL_CATEGORIES[0]);
      setDueDate(toDateOrNull(liability.dueDate) || new Date());
      setMaturityDate(toDateOrNull(liability.maturityDate));
      setIsRecurring(liability.isRecurring !== false);
    }
  }, [liability]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat !== 'Loan EMI') {
      setMaturityDate(null);
    }
  };

  const handleDuePickerPress = () => {
    if (!DateTimePicker) {
      Alert.alert('Date Picker Unavailable', "This build can't open the native date picker.");
      return;
    }
    setShowDuePicker(true);
  };

  const handleMaturityPickerPress = () => {
    if (!DateTimePicker) {
      Alert.alert('Date Picker Unavailable', "This build can't open the native date picker.");
      return;
    }
    setShowMaturityPicker(true);
  };

  const handleDueDateChange = (event, selectedDate) => {
    setShowDuePicker(Platform.OS === 'ios');
    if (selectedDate) setDueDate(selectedDate);
  };

  const handleMaturityDateChange = (event, selectedDate) => {
    setShowMaturityPicker(Platform.OS === 'ios');
    if (selectedDate) setMaturityDate(selectedDate);
  };

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Validation Error', 'Title and Amount are required.');
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

    setSaving(true);
    try {
      await updateDoc(doc(db, 'mandatory_expenses', liability.id), {
        title: title.trim(),
        amount: parsedAmount,
        category,
        dueDate: dueDate.toISOString().split('T')[0],
        maturityDate: isLoanEmi ? maturityDate.toISOString().split('T')[0] : null,
        isRecurring,
      });
      onClose();
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!liability) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { backgroundColor: currentColors.cardBackground }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.heading, { color: currentColors.textPrimary }]}>Edit Fixed Liability</Text>

            <TextInput
              style={[styles.input, { color: currentColors.textPrimary, borderColor: currentColors.border }]}
              placeholder="Title"
              placeholderTextColor={currentColors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, { color: currentColors.textPrimary, borderColor: currentColors.border }]}
              placeholder="Amount (₹)"
              placeholderTextColor={currentColors.textSecondary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={[styles.label, { color: currentColors.textSecondary }]}>Due Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: currentColors.border, backgroundColor: currentColors.background }]}
              onPress={handleDuePickerPress}
            >
              <Text style={{ color: currentColors.textPrimary, fontSize: 15 }}>📅 {formatDate(dueDate)}</Text>
            </TouchableOpacity>
            {showDuePicker && DateTimePicker && (
              <DateTimePicker value={dueDate} mode="date" display="default" onChange={handleDueDateChange} />
            )}

            <View style={styles.recurringRow}>
              <Text style={[styles.label, { color: currentColors.textSecondary, marginTop: 0, marginBottom: 0 }]}>
                Recurring Monthly Bill
              </Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: currentColors.border, true: currentColors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Text style={[styles.label, { color: currentColors.textSecondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {FIXED_BILL_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? currentColors.accent : 'transparent',
                        borderColor: isSelected ? currentColors.accent : currentColors.border,
                      },
                    ]}
                    onPress={() => handleCategoryChange(cat)}
                  >
                    <Text style={[styles.chipText, { color: isSelected ? '#FFF' : currentColors.textPrimary }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isLoanEmi && (
              <>
                <Text style={[styles.label, { color: currentColors.textSecondary }]}>Loan Maturity / End Date</Text>
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: currentColors.border, backgroundColor: currentColors.background }]}
                  onPress={handleMaturityPickerPress}
                >
                  <Text style={{ color: maturityDate ? currentColors.textPrimary : currentColors.textSecondary, fontSize: 15 }}>
                    🏁 {maturityDate ? formatDate(maturityDate) : 'Select the loan end date'}
                  </Text>
                </TouchableOpacity>
                {showMaturityPicker && DateTimePicker && (
                  <DateTimePicker
                    value={maturityDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleMaturityDateChange}
                  />
                )}
              </>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: currentColors.accent }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  container: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
    gap: 12,
  },
  cancelBtn: {
    padding: spacing.sm,
  },
  cancelText: {
    color: '#9CA3AF',
  },
  saveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  saveText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
