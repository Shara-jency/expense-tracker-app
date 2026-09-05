import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getGlobalStyles = (themeMode = 'dark') => {
  const currentColors = colors[themeMode] || colors.dark;

  return StyleSheet.create({
    // Common Screen Layouts
    container: {
      flex: 1,
      backgroundColor: currentColors.background,
      padding: spacing.md,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentColors.background,
    },

    // Auth Screen Styles
    authContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: currentColors.background,
    },
    authHeaderContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    authTitle: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: spacing.sm,
      color: currentColors.textPrimary,
    },
    authSubtitle: {
      fontSize: 14,
      textAlign: 'center',
      color: currentColors.textSecondary,
    },
    authFormContainer: {
      width: '100%',
    },
    authInput: {
      height: 50,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
      fontSize: 16,
      backgroundColor: currentColors.cardBackground,
      color: currentColors.textPrimary,
      borderColor: currentColors.border,
    },
    authButton: {
      height: 50,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.sm,
      backgroundColor: currentColors.accent,
    },
    authButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    authSwitchButton: {
      marginTop: 20,
    },
    authSwitchText: {
      color: currentColors.textSecondary,
      textAlign: 'center',
    },
    authHighlightText: {
      color: currentColors.accent,
      fontWeight: 'bold',
    },
    
    // StatCard Component Styles
    statCard: {
      backgroundColor: currentColors.cardBackground,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      flex: 1,
      marginHorizontal: spacing.xs,
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    statCardLeak: {
      borderColor: currentColors.danger,
    },
    statTitle: {
      color: currentColors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    statAmount: {
      color: currentColors.textPrimary,
      fontSize: 22,
      fontWeight: 'bold',
      marginVertical: spacing.xs,
    },
    statLeakAmount: {
      color: currentColors.danger,
    },

    // InsightCard Component Styles
    insightCard: {
      backgroundColor: currentColors.cardBackground,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginVertical: spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: currentColors.danger,
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    insightHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    insightBadge: {
      color: currentColors.danger,
      fontSize: 11,
      fontWeight: 'bold',
    },
    insightPercentage: {
      color: currentColors.danger,
      fontWeight: 'bold',
      fontSize: 13,
    },
    insightText: {
      color: currentColors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },

    // TransactionRow Component Styles
    transactionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: currentColors.border,
    },
    transactionTitle: {
      color: currentColors.textPrimary,
      fontSize: 15,
      fontWeight: '500',
    },
    transactionMeta: {
      color: currentColors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    transactionAmount: {
      color: currentColors.danger,
      fontSize: 15,
      fontWeight: 'bold',
    },
    leakBadge: {
      color: currentColors.danger,
      fontSize: 10,
      fontWeight: 'bold',
      backgroundColor: currentColors.dangerLight,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      marginTop: 2,
      textAlign: 'center',
    },
  });
};