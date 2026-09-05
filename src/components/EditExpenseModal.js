import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors, borderRadius, spacing } from '../styles/theme';

export default function EditExpenseModal({ visible, expense, onClose, theme = 'dark' }) {
  const currentColors = colors[theme] || colors.dark;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setAmount(expense.amount ? String(expense.amount) : '');
      setCategory(expense.category || '');
    }
  }, [expense]);

  const handleSave = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Validation Error', 'Title and Amount are required.');
      return;
    }

    setSaving(true);
    try {
      const expenseRef = doc(db, 'expenses', expense.id);
      await updateDoc(expenseRef, {
        title: title.trim(),
        amount: parseFloat(amount),
        category: category.trim() || 'Other',
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
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
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
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <TextInput
            style={[styles.input, { color: currentColors.textPrimary, borderColor: currentColors.border }]}
            placeholder="Category"
            placeholderTextColor={currentColors.textSecondary}
            value={category}
            onChangeText={setCategory}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    backgroundColor: '#3B82F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  saveText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});