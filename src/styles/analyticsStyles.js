import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getAnalyticsStyles = (themeMode = 'dark') => {
  const currentColors = colors[themeMode] || colors.dark;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentColors.background,
      paddingHorizontal: spacing.md,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
      marginVertical: spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    chartCard: {
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: currentColors.border,
      marginVertical: spacing.sm,
    },
    leakSummaryContainer: {
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: currentColors.danger,
      marginVertical: spacing.sm,
    },
    leakSummaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    leakSummaryTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentColors.danger,
    },
    leakTotalText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
    },
    leakDescription: {
      fontSize: 13,
      color: currentColors.textSecondary,
      marginTop: spacing.xs,
    },
    loanSummaryContainer: {
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: currentColors.accent,
      marginVertical: spacing.sm,
    },
    loanSummaryTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentColors.accent,
    },
    emptyText: {
      color: currentColors.textSecondary,
      textAlign: 'center',
      marginVertical: spacing.xl,
    },
    incomeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: currentColors.accent,
      padding: spacing.sm,
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    incomeBannerText: {
      fontSize: 12,
      color: currentColors.textSecondary,
      flex: 1,
      lineHeight: 16,
    },
  });
};