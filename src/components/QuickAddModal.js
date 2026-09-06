import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { colors, borderRadius, spacing } from '../styles/theme';
import { EXPENSE_CATEGORIES } from '../constants/categories';

// Safe conditional import so missing package does not throw a fatal crash
let DateTimePicker;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  DateTimePicker = null;
}

export default function QuickAddModal({ visible, onClose, theme = 'dark' }) {
  const currentColors = colors[theme] || colors.dark;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setExpenseDate(new Date());
    setReceiptUri(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleAddExpense = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Validation Error', 'Please fill in both title and amount.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount.');
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
        amount: parsedAmount,
        category: category,
        expenseDate: expenseDate.toISOString(),
        receiptUri: receiptUri || null,
        createdAt: serverTimestamp(),
      });

      handleClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not save expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpenseDate(selectedDate);
    }
  };

  const handleDatePickerPress = () => {
    if (!DateTimePicker) {
      Alert.alert(
        'Date Picker Unavailable',
        'Optional date selector requires @react-native-community/datetimepicker. Today\'s date will be used by default.'
      );
      return;
    }
    setShowDatePicker(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { backgroundColor: currentColors.cardBackground }]}>
          <Text style={[styles.title, { color: currentColors.textPrimary }]}>⚡ Quick Expense Entry</Text>

          {/* Title Input */}
          <TextInput
            style={[styles.input, { color: currentColors.textPrimary, borderColor: currentColors.border }]}
            placeholder="Expense title (e.g., Coffee, Uber)"
            placeholderTextColor={currentColors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />

          {/* Amount Input */}
          <TextInput
            style={[styles.input, { color: currentColors.textPrimary, borderColor: currentColors.border }]}
            placeholder="Amount (₹)"
            placeholderTextColor={currentColors.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Category Chips */}
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

          {/* Date Selector */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: currentColors.border }]}
              onPress={handleDatePickerPress}
            >
              <Text style={{ color: currentColors.textPrimary }}>
                📅 {expenseDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </TouchableOpacity>

            {/* Receipt Image Button */}
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: currentColors.border }]}
              onPress={handlePickImage}
            >
              <Text style={{ color: currentColors.textPrimary }}>
                {receiptUri ? '🖼️ Receipt Added' : '📷 Attach Receipt'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Receipt Preview */}
          {receiptUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: receiptUri }} style={styles.receiptPreview} />
              <TouchableOpacity onPress={() => setReceiptUri(null)}>
                <Text style={styles.removeReceiptText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Date Picker Component */}
          {showDatePicker && DateTimePicker && (
            <DateTimePicker
              value={expenseDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: currentColors.accent }]}
              onPress={handleAddExpense}
              disabled={loading}
            >
              <Text style={styles.submitText}>{loading ? 'Saving...' : 'Add Expense'}</Text>
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  receiptPreview: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xs,
  },
  removeReceiptText: {
    color: '#EF4444',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: spacing.xs,
  },
  cancelButton: {
    padding: spacing.sm,
  },
  cancelText: {
    color: '#9CA3AF',
  },
  submitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  submitText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});