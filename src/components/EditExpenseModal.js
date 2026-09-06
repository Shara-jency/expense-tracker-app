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
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, borderRadius, spacing } from '../styles/theme';
import { EXPENSE_CATEGORIES } from '../constants/categories';

export default function EditExpenseModal({ visible, expense, onClose, theme = 'dark' }) {
  const currentColors = colors[theme] || colors.dark;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setAmount(expense.amount ? String(expense.amount) : '');
      setCategory(expense.category || EXPENSE_CATEGORIES[0]);
    }
  }, [expense]);

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

    setSaving(true);
    try {
      const expenseRef = doc(db, 'expenses', expense.id);
      await updateDoc(expenseRef, {
        title: title.trim(),
        amount: parsedAmount,
        category,
      });
      onClose();
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!expense) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { backgroundColor: currentColors.cardBackground }]}>
          <Text style={[styles.heading, { color: currentColors.textPrimary }]}>Edit Expense</Text>

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

          <Text style={[styles.label, { color: currentColors.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {EXPENSE_CATEGORIES.map((cat) => {
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
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#FFF' : currentColors.textPrimary }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
