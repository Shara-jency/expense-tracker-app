import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ACTIVE_KEY = '@spendlens/last_active_at';

// Default session timeout: log the user out after this long with no activity,
// whether the app was idle in the foreground or closed/backgrounded entirely.
export const SESSION_TIMEOUT_MS = 10 * 60 * 1000;

let lastWriteAt = 0;
const WRITE_THROTTLE_MS = 5000;

/**
 * Records "now" as the last time the user did something (a touch anywhere
 * in the app, or the app returning to the foreground). Throttled so rapid
 * touches/scrolling don't hammer AsyncStorage.
 */
export const recordActivity = async () => {
  const now = Date.now();
  if (now - lastWriteAt < WRITE_THROTTLE_MS) return;
  lastWriteAt = now;

  try {
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, String(now));
  } catch (error) {
    console.warn('Failed to record activity timestamp:', error);
  }
};

/**
 * True if more than SESSION_TIMEOUT_MS has elapsed since the last recorded
 * activity — covers both "idle while open" and "closed and reopened later".
 */
export const hasSessionExpired = async () => {
  try {
    const stored = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
    if (!stored) return false;

    return Date.now() - Number(stored) > SESSION_TIMEOUT_MS;
  } catch (error) {
    console.warn('Failed to read last active timestamp:', error);
    return false;
  }
};

/**
 * Clears the saved activity timestamp (called on forced logout so a stale
 * expiry isn't reused for the next session).
 */
export const clearActivity = async () => {
  lastWriteAt = 0;
  try {
    await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
  } catch (error) {
    console.warn('Failed to clear activity timestamp:', error);
  }
};
