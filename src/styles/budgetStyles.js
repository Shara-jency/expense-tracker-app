import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getBudgetStyles = (themeMode = 'dark') => {
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    categoryName: {
      fontSize: 15,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
    },
    amountText: {
      fontSize: 13,
      color: currentColors.textSecondary,
    },
    progressBarBg: {
      height: 10,
      backgroundColor: currentColors.border,
      borderRadius: 5,
      overflow: 'hidden',
      marginTop: spacing.xs,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 5,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: spacing.xs,
      textAlign: 'right',
    },
  });
};