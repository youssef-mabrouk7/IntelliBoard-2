import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Moon, Sun, Smartphone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppPreferencesStore } from '@/stores/appPreferencesStore';

type ThemeMode = 'light' | 'dark' | 'system';

export default function AppearanceScreen() {
  const selectedTheme = useAppPreferencesStore((s) => s.themeMode) as ThemeMode;
  const setThemeMode = useAppPreferencesStore((s) => s.setThemeMode);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const theme = Colors.current;
  const styles = createStyles(theme);

  const onSelectTheme = async (mode: ThemeMode) => {
    await setThemeMode(mode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          
          <View style={styles.themeGrid}>
            <TouchableOpacity
              style={[styles.themeCard, selectedTheme === 'light' && styles.themeCardSelected]}
              onPress={() => void onSelectTheme('light')}
            >
              <View style={[styles.themeIcon, { backgroundColor: '#FFF8E1' }]}>
                <Sun size={24} color={Colors.light.warning} />
              </View>
              <Text style={styles.themeName}>Light</Text>
              {selectedTheme === 'light' && <View style={styles.checkIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeCard, selectedTheme === 'dark' && styles.themeCardSelected]}
              onPress={() => void onSelectTheme('dark')}
            >
              <View style={[styles.themeIcon, { backgroundColor: '#E3F2FD' }]}>
                <Moon size={24} color={Colors.light.tint} />
              </View>
              <Text style={styles.themeName}>Dark</Text>
              {selectedTheme === 'dark' && <View style={styles.checkIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeCard, selectedTheme === 'system' && styles.themeCardSelected]}
              onPress={() => void onSelectTheme('system')}
            >
              <View style={[styles.themeIcon, { backgroundColor: '#E8F5E9' }]}>
                <Smartphone size={24} color={Colors.light.status.completed} />
              </View>
              <Text style={styles.themeName}>System</Text>
              {selectedTheme === 'system' && <View style={styles.checkIndicator} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          
          <View style={styles.toggleItem}>
            <View>
              <Text style={styles.toggleTitle}>Reduce Motion</Text>
              <Text style={styles.toggleDescription}>Minimize animations throughout the app</Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={setReduceMotion}
              trackColor={{ false: theme.border, true: theme.tint }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleItem}>
            <View>
              <Text style={styles.toggleTitle}>High Contrast</Text>
              <Text style={styles.toggleDescription}>Increase contrast for better visibility</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: theme.border, true: theme.tint }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewItem}>
              <View style={styles.previewDot} />
              <View style={styles.previewLine} />
            </View>
            <View style={styles.previewItem}>
              <View style={styles.previewDot} />
              <View style={[styles.previewLine, { width: '60%' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.tintDark,
  },
  section: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: theme.tint,
  },
  themeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
  },
  checkIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.tint,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  previewSection: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  previewCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.tint,
  },
  previewLine: {
    flex: 1,
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
  },
});
