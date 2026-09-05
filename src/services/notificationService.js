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