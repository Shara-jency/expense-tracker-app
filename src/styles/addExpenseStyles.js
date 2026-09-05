import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getAddExpenseStyles = (themeMode = 'dark') => {
  const currentColors = colors[themeMode] || colors.dark;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentColors.background,
      padding: spacing.md,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
      marginVertical: spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: currentColors.textSecondary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      backgroundColor: currentColors.cardBackground,
      color: currentColors.textPrimary,
      borderColor: currentColors.border,
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: spacing.xs,
    },
    categoryChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: currentColors.border,
      backgroundColor: currentColors.cardBackground,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    selectedCategoryChip: {
      backgroundColor: currentColors.accent,
      borderColor: currentColors.accent,
    },
    categoryChipText: {
      color: currentColors.textSecondary,
      fontSize: 13,
    },
    selectedCategoryChipText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: spacing.md,
      padding: spacing.md,
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    switchLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: currentColors.textPrimary,
    },
    switchSublabel: {
      fontSize: 12,
      color: currentColors.danger,
      marginTop: 2,
    },
    submitButton: {
      height: 50,
      borderRadius: borderRadius.md,
      backgroundColor: currentColors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
};