import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { create } from 'zustand';

import type { AppLanguage } from '@/constants/i18n';

const STORAGE_KEY = 'app_preferences_v1';

type DateFormat = 'mdy' | 'dmy' | 'ymd';
type TimeFormat = '12h' | '24h';
type ThemeMode = 'light' | 'dark' | 'system';

type AppPreferencesState = {
  language: AppLanguage;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  themeMode: ThemeMode;
  onboardingCompleted: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  setDateFormat: (dateFormat: DateFormat) => Promise<void>;
  setTimeFormat: (timeFormat: TimeFormat) => Promise<void>;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
};

async function persist(
  state: Pick<AppPreferencesState, 'language' | 'dateFormat' | 'timeFormat' | 'themeMode' | 'onboardingCompleted'>,
) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useAppPreferencesStore = create<AppPreferencesState>((set, get) => ({
  language: 'en',
  dateFormat: 'mdy',
  timeFormat: '12h',
  themeMode: 'light',
  onboardingCompleted: false,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppPreferencesState>;
        set({
          language: parsed.language === 'ar' ? 'ar' : 'en',
          dateFormat: parsed.dateFormat === 'dmy' || parsed.dateFormat === 'ymd' ? parsed.dateFormat : 'mdy',
          timeFormat: parsed.timeFormat === '24h' ? '24h' : '12h',
          themeMode: parsed.themeMode === 'light' || parsed.themeMode === 'dark' ? parsed.themeMode : 'light',
          onboardingCompleted: Boolean(parsed.onboardingCompleted),
        });
      }
    } finally {
      set({ hydrated: true });
    }
  },
  setLanguage: async (language) => {
    set({ language });
    I18nManager.allowRTL(true);
    const isRTL = language === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
    const { dateFormat, timeFormat, themeMode, onboardingCompleted } = get();
    await persist({ language, dateFormat, timeFormat, themeMode, onboardingCompleted });
  },
  setDateFormat: async (dateFormat) => {
    set({ dateFormat });
    const { language, timeFormat, themeMode, onboardingCompleted } = get();
    await persist({ language, dateFormat, timeFormat, themeMode, onboardingCompleted });
  },
  setTimeFormat: async (timeFormat) => {
    set({ timeFormat });
    const { language, dateFormat, themeMode, onboardingCompleted } = get();
    await persist({ language, dateFormat, timeFormat, themeMode, onboardingCompleted });
  },
  setThemeMode: async (themeMode) => {
    set({ themeMode });
    const { language, dateFormat, timeFormat, onboardingCompleted } = get();
    await persist({ language, dateFormat, timeFormat, themeMode, onboardingCompleted });
  },
  setOnboardingCompleted: async (onboardingCompleted) => {
    set({ onboardingCompleted });
    const { language, dateFormat, timeFormat, themeMode } = get();
    await persist({ language, dateFormat, timeFormat, themeMode, onboardingCompleted });
  },
}));
