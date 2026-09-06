import AsyncStorage from '@react-native-async-storage/async-storage';

const HIDE_AMOUNTS_KEY = '@spendlens/hide_amounts';

/**
 * Reads the user's saved "hide amounts" privacy preference. Plain
 * AsyncStorage-backed so it can be read from non-React code (e.g. when
 * composing a notification body), not just from PrivacyContext.
 */
export const isHideAmountsEnabled = async () => {
  try {
    const stored = await AsyncStorage.getItem(HIDE_AMOUNTS_KEY);
    return stored === 'true';
  } catch (error) {
    console.warn('Failed to read hide-amounts preference:', error);
    return false;
  }
};

export const setHideAmountsEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(HIDE_AMOUNTS_KEY, String(enabled));
  } catch (error) {
    console.warn('Failed to persist hide-amounts preference:', error);
  }
};
