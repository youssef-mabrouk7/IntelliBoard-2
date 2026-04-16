import { Appearance } from 'react-native';
import { useAppPreferencesStore } from '@/stores/appPreferencesStore';

const primary = "#4A7C9B";
const primaryDark = "#2C4A5E";
const primaryLight = "#6B9AB8";

const light = {
    text: "#1A1A1A",
    textSecondary: "#666666",
    textMuted: "#999999",
    background: "#F5F7FA",
    card: "#FFFFFF",
    cardSecondary: "#F0F2F5",
    tint: primary,
    tintDark: primaryDark,
    tintLight: primaryLight,
    tabIconDefault: "#999999",
    tabIconSelected: primary,
    border: "#E5E8EC",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    priority: {
      high: "#E57373",
      medium: "#FFB74D",
      low: "#81C784",
    },
    status: {
      active: "#4A7C9B",
      completed: "#4CAF50",
      overdue: "#F44336",
      inProgress: "#2196F3",
      onHold: "#FF9800",
    },
};

const dark = {
  text: "#F2F4F8",
  textSecondary: "#A9B1BC",
  textMuted: "#7F8792",
  background: "#0F1217",
  card: "#1A2028",
  cardSecondary: "#141A22",
  tint: primaryLight,
  tintDark: "#8FB6CF",
  tintLight: "#B9D6E7",
  tabIconDefault: "#7F8792",
  tabIconSelected: primaryLight,
  border: "#2A3340",
  success: "#66BB6A",
  warning: "#FFB74D",
  error: "#EF5350",
  info: "#42A5F5",
  priority: {
    high: "#E57373",
    medium: "#FFB74D",
    low: "#81C784",
  },
  status: {
    active: "#6B9AB8",
    completed: "#66BB6A",
    overdue: "#EF5350",
    inProgress: "#42A5F5",
    onHold: "#FFB74D",
  },
};

export function getThemeColors() {
  const mode = useAppPreferencesStore.getState().themeMode;
  if (mode === 'light') return light;
  if (mode === 'dark') return dark;
  return Appearance.getColorScheme() === 'dark' ? dark : light;
}

const Colors = {
  light,
  dark,
  get current() {
    return getThemeColors();
  },
};

export default new Proxy(Colors, {
  get(target, prop: keyof typeof Colors) {
    if (prop === 'light') return getThemeColors();
    if (prop === 'current') return getThemeColors();
    return target[prop];
  },
});
