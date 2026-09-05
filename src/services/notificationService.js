import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Helper to check if running inside Expo Go on Android
const isAndroidExpoGo = Platform.OS === 'android' && Constants.appOwnership === 'expo';

// Safe wrapper for foreground notification handler configuration
try {
  if (!isAndroidExpoGo) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (error) {
  console.warn('Could not set notification handler:', error);
}

/**
 * Requests notification permissions from the operating system and registers default channel.
 */
export const requestNotificationPermissions = async () => {
  if (isAndroidExpoGo) {
    console.warn('Notifications disabled in Expo Go on Android. Use a Development Build for native push testing.');
    return false;
  }

  try {
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
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.warn('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedules a local push notification for an upcoming mandatory bill.
 */
export const scheduleBillReminder = async (billTitle, amount, dueDateDay) => {
  if (isAndroidExpoGo) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const now = new Date();
  let scheduledDate = new Date(now.getFullYear(), now.getMonth(), dueDateDay, 9, 0, 0);

  if (scheduledDate < now) {
    scheduledDate.setMonth(scheduledDate.getMonth() + 1);
  }

  const triggerDate = new Date(scheduledDate);
  triggerDate.setDate(triggerDate.getDate() - 1);

  const secondsUntilTrigger = Math.max(10, Math.floor((triggerDate.getTime() - Date.now()) / 1000));

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ Upcoming Bill Reminder: ${billTitle}`,
        body: `Your payment of ₹${amount ? amount.toLocaleString('en-IN') : '0'} for ${billTitle} is due tomorrow!`,
        data: { billTitle, amount },
      },
      trigger: {
        channelId: 'default',
        seconds: secondsUntilTrigger,
      },
    });
  } catch (error) {
    console.error('Failed to schedule bill notification:', error);
  }
};

/**
 * Schedules or updates a recurring weekly reminder on weekend mornings.
 */
export const scheduleWeeklyLoggingReminder = async (weekday = 7, hour = 9, minute = 0) => {
  if (isAndroidExpoGo) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  try {
    // FIXED: Plural "getAllScheduledNotificationsAsync"
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
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
        channelId: 'default',
        weekday,
        hour,
        minute,
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
  if (isAndroidExpoGo) return;

  try {
    // FIXED: Plural "getAllScheduledNotificationsAsync"
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of scheduled) {
      if (item.content.data?.type === 'WEEKLY_LOG_REMINDER') {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
    }
  } catch (error) {
    console.error('Failed to cancel weekly reminder:', error);
  }
};