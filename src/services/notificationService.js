import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Detect whether the app is running inside Expo Go.
 *
 * expo-notifications native functionality is unavailable
 * in Expo Go on Android (SDK 53+).
 */
const isExpoGo =
  Constants.executionEnvironment === 'storeClient';

/**
 * Notifications are disabled only when running inside
 * Expo Go on Android.
 *
 * They will work in:
 * - EAS Development Build
 * - Preview APK
 * - Production build
 */
const notificationsAvailable = !(
  Platform.OS === 'android' && isExpoGo
);


/**
 * Dynamically load expo-notifications.
 *
 * IMPORTANT:
 * Do not use:
 *
 * import * as Notifications from 'expo-notifications';
 *
 * at the top of this file.
 *
 * Dynamic import prevents Expo Go from loading the native
 * notification module during application startup.
 */
const getNotifications = async () => {
  if (!notificationsAvailable) {
    return null;
  }

  try {
    const Notifications =
      await import('expo-notifications');

    return Notifications;
  } catch (error) {
    console.warn(
      'Unable to load expo-notifications:',
      error
    );

    return null;
  }
};


/**
 * Configure foreground notification behavior.
 *
 * This should be called once when the app starts.
 */
export const configureNotifications = async () => {
  if (!notificationsAvailable) {
    console.log(
      'Notifications unavailable in Expo Go.'
    );
    return false;
  }

  try {
    const Notifications = await getNotifications();

    if (!Notifications) {
      return false;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    return true;

  } catch (error) {
    console.warn(
      'Failed to configure notification handler:',
      error
    );

    return false;
  }
};


/**
 * Request notification permissions.
 *
 * Also creates the Android notification channel.
 *
 * @returns {Promise<boolean>}
 */
export const requestNotificationPermissions = async () => {
  if (!notificationsAvailable) {
    console.log(
      'Notifications skipped: Expo Go does not support expo-notifications on Android.'
    );
    return false;
  }

  try {
    const Notifications = await getNotifications();

    if (!Notifications) {
      return false;
    }

    /**
     * Create Android notification channel first.
     */
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'default',
        {
          name: 'SpendLens Bill Alerts',

          importance:
            Notifications.AndroidImportance.HIGH,

          vibrationPattern: [
            0,
            250,
            250,
            250,
          ],

          lightColor: '#3B82F6',

          sound: 'default',
        }
      );
    }

    /**
     * Check existing permission.
     */
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    /**
     * Request permission if necessary.
     */
    if (existingStatus !== 'granted') {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn(
        'Notification permission was not granted.'
      );

      return false;
    }

    console.log(
      'Notification permissions enabled.'
    );

    return true;

  } catch (error) {
    console.error(
      'Notification permission error:',
      error
    );

    return false;
  }
};


/**
 * Schedule a bill reminder.
 *
 * Notification is scheduled one day before
 * the bill due date.
 *
 * @param {string} billTitle
 * @param {number} amount
 * @param {number} dueDateDay
 */
export const scheduleBillReminder = async (
  billTitle,
  amount,
  dueDateDay
) => {
  if (!notificationsAvailable) {
    console.log(
      'Bill reminder skipped: notifications unavailable.'
    );

    return;
  }

  try {
    const hasPermission =
      await requestNotificationPermissions();

    if (!hasPermission) {
      return;
    }

    const Notifications =
      await getNotifications();

    if (!Notifications) {
      return;
    }

    const now = new Date();

    /**
     * Create due date at 9:00 AM.
     */
    let dueDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      dueDateDay,
      9,
      0,
      0
    );

    /**
     * If due date already passed,
     * schedule for next month.
     */
    if (dueDate <= now) {
      dueDate.setMonth(
        dueDate.getMonth() + 1
      );
    }

    /**
     * Reminder one day before.
     */
    const triggerDate = new Date(dueDate);

    triggerDate.setDate(
      triggerDate.getDate() - 1
    );

    /**
     * Never schedule in the past.
     */
    if (triggerDate <= now) {
      triggerDate.setTime(
        now.getTime() + 60 * 1000
      );
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ Upcoming Bill: ${billTitle}`,

        body:
          `Your payment of ₹${Number(
            amount || 0
          ).toLocaleString(
            'en-IN'
          )} is due tomorrow.`,

        sound: 'default',

        data: {
          type: 'BILL_REMINDER',
          billTitle,
          amount,
        },
      },

      trigger: {
        type:
          Notifications.SchedulableTriggerInputTypes.DATE,

        date: triggerDate,

        channelId: 'default',
      },
    });

    console.log(
      `Bill reminder scheduled for ${billTitle}`
    );

  } catch (error) {
    console.error(
      'Failed to schedule bill reminder:',
      error
    );
  }
};


/**
 * Schedule a recurring weekly financial reminder.
 *
 * weekday:
 * 1 = Sunday
 * 2 = Monday
 * ...
 * 7 = Saturday
 *
 * @param {number} weekday
 * @param {number} hour
 * @param {number} minute
 */
export const scheduleWeeklyLoggingReminder = async (
  weekday = 7,
  hour = 9,
  minute = 0
) => {
  if (!notificationsAvailable) {
    console.log(
      'Weekly reminder skipped: notifications unavailable.'
    );

    return;
  }

  try {
    const hasPermission =
      await requestNotificationPermissions();

    if (!hasPermission) {
      return;
    }

    const Notifications =
      await getNotifications();

    if (!Notifications) {
      return;
    }

    /**
     * Remove existing weekly reminders.
     * This prevents duplicates.
     */
    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const item of scheduled) {
      if (
        item.content.data?.type ===
        'WEEKLY_LOG_REMINDER'
      ) {
        await Notifications.cancelScheduledNotificationAsync(
          item.identifier
        );
      }
    }

    const dayName =
      weekday === 1
        ? 'Sunday'
        : weekday === 7
          ? 'Saturday'
          : 'your selected day';

    /**
     * Create recurring notification.
     */
    await Notifications.scheduleNotificationAsync({
      content: {
        title:
          '📊 Weekend Financial Check-in',

        body:
          `Did you miss logging any expenses this week? Review your spending before ${dayName}!`,

        sound: 'default',

        data: {
          type: 'WEEKLY_LOG_REMINDER',
        },
      },

      trigger: {
        type:
          Notifications.SchedulableTriggerInputTypes.WEEKLY,

        weekday,

        hour,

        minute,

        repeats: true,

        channelId: 'default',
      },
    });

    console.log(
      'Weekly financial reminder scheduled.'
    );

  } catch (error) {
    console.error(
      'Failed to schedule weekly reminder:',
      error
    );
  }
};


/**
 * Cancel all weekly logging reminders.
 */
export const cancelWeeklyLoggingReminder = async () => {
  if (!notificationsAvailable) {
    return;
  }

  try {
    const Notifications =
      await getNotifications();

    if (!Notifications) {
      return;
    }

    const scheduled =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const item of scheduled) {
      if (
        item.content.data?.type ===
        'WEEKLY_LOG_REMINDER'
      ) {
        await Notifications.cancelScheduledNotificationAsync(
          item.identifier
        );
      }
    }

    console.log(
      'Weekly reminders cancelled.'
    );

  } catch (error) {
    console.error(
      'Failed to cancel weekly reminder:',
      error
    );
  }
};


/**
 * Check whether notifications are available
 * in the current runtime environment.
 */
export const areNotificationsAvailable = () => {
  return notificationsAvailable;
};