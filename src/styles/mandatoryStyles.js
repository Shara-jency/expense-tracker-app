import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getMandatoryStyles = (themeMode = 'dark') => {
  const currentColors = colors[themeMode] || colors.dark;

  return StyleSheet.create({
    card: {
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginVertical: spacing.xs,
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    cardOverdue: {
      borderColor: currentColors.danger,
      backgroundColor: currentColors.dangerLight || '#2A1215',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    actions: {
      flexDirection: 'row',
      gap: 4,
      marginLeft: spacing.sm,
    },
    iconButton: {
      width: 26,
      height: 26,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentColors.background,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      color: currentColors.textPrimary,
    },
    dueDate: {
      fontSize: 12,
      color: currentColors.textSecondary,
      marginTop: 2,
    },
    maturityText: {
      fontSize: 11,
      fontWeight: '600',
      color: currentColors.accent,
      marginTop: 2,
    },
    recurringBadge: {
      width: 16,
      height: 16,
      borderRadius: borderRadius.xs,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: `${currentColors.accent}26`,
    },
    lastPaidText: {
      fontSize: 11,
      color: currentColors.textSecondary,
      marginTop: 2,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: currentColors.border,
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
    },
    statusBadge: {
      fontSize: 11,
      fontWeight: 'bold',
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
  });
};
