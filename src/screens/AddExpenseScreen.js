import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { getAddExpenseStyles } from '../styles/addExpenseStyles';

const CATEGORIES = ['Food Delivery', 'Shopping', 'Subscriptions', 'Transport', 'Utilities', 'Entertainment', 'Other'];

export default function AddExpenseScreen({ navigation }) {
  const { theme, colors } = useTheme();
  const styles = getAddExpenseStyles(theme);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food Delivery');
  const [isLeak, setIsLeak] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddExpense = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Missing Fields', 'Please fill in both title and amount.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid numeric spend amount.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        userId: auth.currentUser?.uid,
        title: title.trim(),
        amount: numericAmount,
        category,
        isLeak,
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      });

      Alert.alert('Success', 'Expense logged successfully!');
      setTitle('');
      setAmount('');
      setIsLeak(false);
      
      if (navigation) navigation.goBack();
    } catch (error) {
      Alert.alert('Firestore Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>Add Expense</Text>

      <Text style={styles.label}>Title / Merchant</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Zomato, Amazon, Uber"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Amount (₹)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor={colors.textSecondary}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, isSelected && styles.selectedCategoryChip]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryChipText, isSelected && styles.selectedCategoryChipText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.switchContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Flag as Financial Leak?</Text>
          <Text style={styles.switchSublabel}>
            Mark impulse buys, food delivery, or unnecessary micro-transfers.
          </Text>
        </View>
        <Switch
          value={isLeak}
          onValueChange={setIsLeak}
          trackColor={{ false: colors.border, true: colors.danger }}
          thumbColor="#FFFFFF"
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleAddExpense}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Save Expense</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}