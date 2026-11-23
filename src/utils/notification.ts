import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const NOTIFICATION_IDS_KEY = "@period-cycle/notification-ids";
const PERIOD_REMINDER_ID_KEY = "@period-cycle/period-reminder-id";

const REMINDER_TIMES = [
  { hour: 6, minute: 0 },
  { hour: 9, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 15, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 21, minute: 0 },
];

// Display notifications while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permission.
async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted) {
    return true;
  }

  const permission = await Notifications.requestPermissionsAsync();
  return permission.granted;
}

// Cancel all daily wellness reminders.
export async function disableDailyReminders(): Promise<void> {
  const savedIds = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);

  if (savedIds) {
    try {
      const ids: unknown = JSON.parse(savedIds);

      if (Array.isArray(ids)) {
        for (const id of ids) {
          if (typeof id === "string") {
            await Notifications.cancelScheduledNotificationAsync(id);
          }
        }
      }
    } catch (error) {
      console.error("Error cancelling daily reminders:", error);
    }
  }

  await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
}

// Enable daily wellness reminders.
export async function enableDailyReminders(): Promise<boolean> {
  try {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      return false;
    }

    await disableDailyReminders();

    const scheduledIds: string[] = [];

    try {
      for (const time of REMINDER_TIMES) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "A little wellness reminder 💗",
            body: "Take a moment to check in with yourself and how you're feeling today.",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
          },
        });

        scheduledIds.push(id);
      }

      await AsyncStorage.setItem(
        NOTIFICATION_IDS_KEY,
        JSON.stringify(scheduledIds),
      );

      return true;
    } catch (error) {
      for (const id of scheduledIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }

      throw error;
    }
  } catch (error) {
    console.error("Daily notification scheduling error:", error);
    return false;
  }
}

// Cancel the previously scheduled period reminder.
export async function cancelPeriodReminder(): Promise<void> {
  const savedId = await AsyncStorage.getItem(PERIOD_REMINDER_ID_KEY);

  if (savedId) {
    await Notifications.cancelScheduledNotificationAsync(savedId);
  }

  await AsyncStorage.removeItem(PERIOD_REMINDER_ID_KEY);
}

// Schedule a period reminder 4 days before the expected period date.
export async function schedulePeriodReminder(
  expectedPeriodDate: Date | string,
): Promise<boolean> {
  try {
    let periodDate: Date;

    if (expectedPeriodDate instanceof Date) {
      periodDate = new Date(
        expectedPeriodDate.getFullYear(),
        expectedPeriodDate.getMonth(),
        expectedPeriodDate.getDate(),
      );
    } else {
      const parts = expectedPeriodDate.split("-").map(Number);

      if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
        return false;
      }

      periodDate = new Date(parts[0], parts[1] - 1, parts[2]);

      // Validate the selected calendar date.
      if (
        periodDate.getFullYear() !== parts[0] ||
        periodDate.getMonth() !== parts[1] - 1 ||
        periodDate.getDate() !== parts[2]
      ) {
        return false;
      }
    }

    // Calculate reminder date: 4 days before expected period.
    const reminderDate = new Date(periodDate);
    reminderDate.setDate(reminderDate.getDate() - 4);
    reminderDate.setHours(9, 0, 0, 0);

    // Remove an old reminder if the new reminder date has passed.
    if (reminderDate.getTime() <= Date.now()) {
      await cancelPeriodReminder();
      return false;
    }

    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      return false;
    }

    // Cancel the previous reminder before scheduling another.
    await cancelPeriodReminder();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your period is approaching 💗",
        body: "Your expected period date is 4 days away. Take care of yourself and get prepared!",
        sound: true,
        data: {
          type: "period-reminder",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

    await AsyncStorage.setItem(PERIOD_REMINDER_ID_KEY, notificationId);

    return true;
  } catch (error) {
    console.error("Period reminder scheduling error:", error);
    return false;
  }
}
