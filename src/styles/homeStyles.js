import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getHomeStyles = (themeMode = 'dark') => {
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
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: spacing.lg,
    },
    privacyToggle: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentColors.cardBackground,
      borderWidth: 1,
      borderColor: currentColors.border,
    },
    greeting: {
      fontSize: 14,
      color: currentColors.textSecondary,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
      marginBottom: spacing.lg,
    },
    cardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    card: {
      width: '48%',
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: currentColors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    cardFullWidth: {
      width: '100%',
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: currentColors.textSecondary,
    },
    cardValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentColors.textPrimary,
      marginTop: 4,
    },
    cardSubtitle: {
      fontSize: 11,
      color: currentColors.textSecondary,
      marginTop: 2,
    },
  });
};
