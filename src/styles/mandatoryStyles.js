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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardOverdue: {
      borderColor: currentColors.danger,
      backgroundColor: currentColors.dangerLight || '#2A1215',
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
      marginTop: 4,
      textAlign: 'right',
    },
  });
};