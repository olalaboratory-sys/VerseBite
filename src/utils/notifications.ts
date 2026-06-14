// Local daily-reminder notifications. Best-effort: silently no-ops if the
// platform/permission is unavailable (e.g. web or denied permission).
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

function configure() {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const REMINDER_ID = 'vb-daily-reminder';

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    /* not scheduled / unsupported */
  }
}

/** Request permission and (re)schedule a daily reminder at the given time. */
export async function scheduleDailyReminder(hour: number, minute: number, lang: 'en' | 'ko'): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    configure();
    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted;
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily', { name: 'Daily verse', importance: Notifications.AndroidImportance.DEFAULT });
    }

    await cancelDailyReminder();
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: lang === 'ko' ? '말씀한입' : 'VerseBite',
        body: lang === 'ko' ? '오늘의 말씀이 도착했어요 — 잠시 조용한 시간을 가져보세요.' : 'Your verse for today is ready — take a quiet moment.',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
    return true;
  } catch {
    return false;
  }
}
