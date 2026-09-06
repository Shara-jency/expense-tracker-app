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
    formGroup: {
      marginBottom: spacing.md,
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
    dateButton: {
      height: 50,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: currentColors.cardBackground,
      borderColor: currentColors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dateButtonText: {
      fontSize: 16,
      color: currentColors.textPrimary,
    },
    dateButtonPlaceholder: {
      fontSize: 16,
      color: currentColors.textSecondary,
    },
    loanInfoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: currentColors.accent,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    loanInfoText: {
      fontSize: 12,
      color: currentColors.textSecondary,
      flex: 1,
      lineHeight: 16,
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