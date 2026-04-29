import AsyncStorage from "@react-native-async-storage/async-storage";

import type { CalendarEvent } from "@/constants/types";

const REMINDER_STORAGE_KEY = "event_reminders_v1";
const READ_STORAGE_KEY = "event_notification_read_v1";

type ReminderMap = Record<string, number>;
type ReadMap = Record<string, boolean>;

export type ReminderNotificationItem = {
  id: string;
  eventId: string;
  title: string;
  body: string;
  triggerAt: string;
  eventAt: string;
  isRead: boolean;
};

async function getJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function toEventDateTime(event: CalendarEvent): Date {
  const safeDate = event.date || new Date().toISOString().slice(0, 10);
  const parsed = new Date(`${safeDate} ${event.startTime}`);
  return Number.isNaN(parsed.getTime()) ? new Date(safeDate) : parsed;
}

export async function saveEventReminder(eventId: string, minutesBefore: number) {
  const map = await getJson<ReminderMap>(REMINDER_STORAGE_KEY, {});
  map[eventId] = minutesBefore;
  await setJson(REMINDER_STORAGE_KEY, map);
}

export async function getEventReminder(eventId: string) {
  const map = await getJson<ReminderMap>(REMINDER_STORAGE_KEY, {});
  return map[eventId] ?? 10;
}

export async function getReminderNotifications(events: CalendarEvent[]) {
  const reminders = await getJson<ReminderMap>(REMINDER_STORAGE_KEY, {});
  const readState = await getJson<ReadMap>(READ_STORAGE_KEY, {});
  const now = Date.now();

  const items: ReminderNotificationItem[] = events
    .map((event) => {
      const eventAt = toEventDateTime(event);
      const minutes = reminders[event.id] ?? 10;
      const triggerAt = new Date(eventAt.getTime() - minutes * 60_000);
      if (triggerAt.getTime() > now) return null;
      if (eventAt.getTime() < now - 24 * 60 * 60_000) return null;
      return {
        id: `event-reminder-${event.id}`,
        eventId: event.id,
        title: `Reminder: ${event.title}`,
        body: `Starts at ${event.startTime} (${minutes} min reminder)`,
        triggerAt: triggerAt.toISOString(),
        eventAt: eventAt.toISOString(),
        isRead: Boolean(readState[event.id]),
      } satisfies ReminderNotificationItem;
    })
    .filter(Boolean) as ReminderNotificationItem[];

  return items.sort((a, b) => new Date(b.triggerAt).getTime() - new Date(a.triggerAt).getTime());
}

export async function setReminderNotificationRead(eventId: string, isRead: boolean) {
  const readState = await getJson<ReadMap>(READ_STORAGE_KEY, {});
  readState[eventId] = isRead;
  await setJson(READ_STORAGE_KEY, readState);
}
