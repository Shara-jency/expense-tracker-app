import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { colors, borderRadius, spacing } from '../styles/theme';

export default function QuickAddModal({ visible, onClose, theme = 'dark' }) {
  const currentColors = colors[theme] || colors.dark;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [loading, setLoading] = useState(false);

  const handleAddExpense = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Validation Error', 'Please fill in both title and amount.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Authentication Error', 'User is not logged in.');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'expenses'), {
        userId: user.uid,
        title: title.trim(),
        amount: parseFloat(amount),
        category: category,
        createdAt: serverTimestamp(),
      });

      // Reset form & close modal
      setTitle('');
      setAmount('');
      setCategory('Food & Dining');
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not save expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: currentColors.cardBackground }]}>
          <Text style={[styles.title, { color: currentColors.textPrimary }]}>⚡ Quick Expense Entry</Text>

          <TextInput
            style={[styles.input, { color: currentColors.textPrimary, borderColor: currentColors.border }]}
            placeholder="Expense title (e.g., Coffee, Uber)"
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

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Saving...' : 'Add Expense'}</Text>
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
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  title: {
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: spacing.sm,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  cancelText: {
    color: '#9CA3AF',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  submitText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});