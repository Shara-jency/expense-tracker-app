import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './theme';

export const getAuthStyles = (themeMode = 'dark') => {
  const currentColors = colors[themeMode] || colors.dark;

  return StyleSheet.create({
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
    passwordInputWrap: {
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    passwordInput: {
      height: 50,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingRight: 44,
      fontSize: 16,
      backgroundColor: currentColors.cardBackground,
      color: currentColors.textPrimary,
      borderColor: currentColors.border,
    },
    passwordToggleIcon: {
      position: 'absolute',
      right: spacing.md,
      padding: 4,
    },
    authForgotButton: {
      alignSelf: 'flex-end',
      marginBottom: spacing.sm,
    },
    authForgotText: {
      color: currentColors.accent,
      fontSize: 13,
      fontWeight: '600',
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
  });
};