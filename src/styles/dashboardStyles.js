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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
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
    themeToggleButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: currentColors.cardBackground,
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    themeToggleText: {
      fontSize: 12,
      fontWeight: '600',
      color: currentColors.textPrimary,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    emptyStateText: {
      color: currentColors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xl,
      fontSize: 14,
    },
  });
};