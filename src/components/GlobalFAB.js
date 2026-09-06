import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QuickAddModal from './QuickAddModal';
import { colors } from '../styles/theme';

/**
 * Floating Action Button for triggering Quick Expense Entry anywhere across the app.
 *
 * @param {Object} props
 * @param {'dark' | 'light'} [props.theme='dark'] - Current app theme
 * @param {import('react-native').ViewStyle} [props.style] - Custom container/position overrides
 * @param {Function} [props.onExpenseAdded] - Optional callback triggered after a new expense is logged
 */
export default function GlobalFAB({ theme = 'dark', style, onExpenseAdded }) {
  const currentColors = colors[theme] || colors.dark;

  const [modalVisible, setModalVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <Animated.View style={[{ transform: [{ scale: scaleValue }] }, styles.fabWrapper, style]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: currentColors.accent }]}
          activeOpacity={0.85}
          onPress={() => setModalVisible(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel="Quick Add Expense"
          accessibilityHint="Opens a modal to quickly log a new expense or receipt"
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <QuickAddModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          if (onExpenseAdded) onExpenseAdded();
        }}
        theme={theme}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
