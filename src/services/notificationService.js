import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Requests notification permissions from the operating system.
 */
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permissions not granted.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'SpendLens Bill Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  return true;
};

/**
 * Schedules a local push notification for an upcoming mandatory bill.
 * @param {string} billTitle - Name of the bill
 * @param {number} amount - Amount in INR
 * @param {number} dueDateDay - Day of the month the bill is due (1-31)
 */
export const scheduleBillReminder = async (billTitle, amount, dueDateDay) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const now = new Date();
  let scheduledDate = new Date(now.getFullYear(), now.getMonth(), dueDateDay, 9, 0, 0);

  // If due date has passed this month, schedule for next month
  if (scheduledDate < now) {
    scheduledDate.setMonth(scheduledDate.getMonth() + 1);
  }

  // Trigger 1 day before due date
  const triggerDate = new Date(scheduledDate);
  triggerDate.setDate(triggerDate.getDate() - 1);

  const secondsUntilTrigger = Math.max(10, Math.floor((triggerDate.getTime() - Date.now()) / 1000));

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ Upcoming Bill Reminder: ${billTitle}`,
        body: `Your payment of ₹${amount.toLocaleString('en-IN')} for ${billTitle} is due tomorrow!`,
        data: { billTitle, amount },
      },
      trigger: {
        seconds: secondsUntilTrigger,
      },
    });
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

/**
 * Schedules or updates a recurring weekly reminder on weekend mornings.
 * @param {number} weekday - Expo weekday index: 1 for Sunday, 7 for Saturday (default: 7)
 * @param {number} hour - Hour of the day in 24h format (e.g., 9 for 9:00 AM)
 * @param {number} minute - Minute of the hour (default: 0)
 */
export const scheduleWeeklyLoggingReminder = async (weekday = 7, hour = 9, minute = 0) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  try {
    // Cancel existing weekly log reminders to avoid duplication when preferences change
    const scheduled = await Notifications.getAllScheduledNotificationAsync();
    for (const item of scheduled) {
      if (item.content.data?.type === 'WEEKLY_LOG_REMINDER') {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
    }

    const dayName = weekday === 1 ? 'Sunday' : 'Saturday';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Weekend Financial Check-in',
        body: `Did you miss logging any expenses this week? Tap here to quickly update your logs before starting your ${dayName}!`,
        data: { type: 'WEEKLY_LOG_REMINDER' },
      },
      trigger: {
        weekday: weekday, // 1 = Sunday, 7 = Saturday
        hour: hour,       // e.g., 9 AM
        minute: minute,
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Failed to schedule weekly reminder:', error);
  }
};

/**
 * Cancels all scheduled weekly expense logging reminders.
 */
export const cancelWeeklyLoggingReminder = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationAsync();
    for (const item of scheduled) {
      if (item.content.data?.type === 'WEEKLY_LOG_REMINDER') {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
    }
  } catch (error) {
    console.error('Failed to cancel weekly reminder:', error);
  }
};