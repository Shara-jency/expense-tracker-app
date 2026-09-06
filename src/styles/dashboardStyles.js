import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getDashboardStyles = (themeMode = 'dark') => {
  const currentColors = colors[themeMode] || colors.dark;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentColors.background,
      paddingHorizontal: spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentColors.background,
    },
    greetingText: {
      fontSize: 14,
      color: currentColors.textSecondary,
    },
    userEmailText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    emptyText: {
      color: currentColors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xl,
      fontSize: 14,
    },

    // Summary cards (Total Expenses / Pending Bills)
    summaryCard: {
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: currentColors.border,
      padding: spacing.md,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    summaryIconWrap: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    summaryLabel: {
      fontSize: 12,
      color: currentColors.textSecondary,
      marginBottom: 2,
    },
    summaryAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
    },

    // Recent expense rows
    expenseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: currentColors.border,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
    },
    categoryIconWrap: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    expenseDetails: {
      flex: 1,
      marginRight: spacing.sm,
    },
    expenseTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: currentColors.textPrimary,
    },
    expenseCategory: {
      fontSize: 12,
      color: currentColors.textSecondary,
      marginTop: 2,
    },
    expenseRight: {
      alignItems: 'flex-end',
    },
    expenseAmount: {
      fontSize: 15,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
    },
    expenseActions: {
      flexDirection: 'row',
      gap: 4,
      marginTop: spacing.xs,
    },
    iconButton: {
      width: 26,
      height: 26,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentColors.background,
    },
  });
};
