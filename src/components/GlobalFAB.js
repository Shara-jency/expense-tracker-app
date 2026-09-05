import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import QuickAddModal from './QuickAddModal';

export default function GlobalFAB({ theme = 'dark' }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <QuickAddModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        theme={theme}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
});