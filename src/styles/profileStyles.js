import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getProfileStyles = (themeMode = 'dark') => {
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
    userCard: {
      backgroundColor: currentColors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: currentColors.border,
      marginBottom: spacing.lg,
    },
    avatarPlaceholder: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: currentColors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: 'bold',
    },
    emailText: {
      fontSize: 16,
      fontWeight: '600',
      color: currentColors.textPrimary,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: currentColors.cardBackground,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: currentColors.border,
      marginBottom: spacing.sm,
    },
    settingText: {
      fontSize: 15,
      color: currentColors.textPrimary,
      fontWeight: '500',
    },
    settingSubtext: {
      fontSize: 12,
      color: currentColors.textSecondary,
      marginTop: 2,
    },
    incomeEditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.sm,
    },
    incomeInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      fontSize: 15,
    },
    iconButton: {
      width: 30,
      height: 30,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentColors.background,
    },
    logoutButton: {
      backgroundColor: currentColors.dangerLight,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.xl,
      borderWidth: 1,
      borderColor: currentColors.danger,
    },
    logoutText: {
      color: currentColors.danger,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
};