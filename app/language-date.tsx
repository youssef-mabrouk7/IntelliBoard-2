import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Globe, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppPreferencesStore } from '@/stores/appPreferencesStore';
import { useLocalization } from '@/utils/localization';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
];

const dateFormats = [
  { id: 'mdy', format: 'MM/DD/YYYY', example: '03/21/2026' },
  { id: 'dmy', format: 'DD/MM/YYYY', example: '21/03/2026' },
  { id: 'ymd', format: 'YYYY/MM/DD', example: '2026/03/21' },
];

const timeFormats = [
  { id: '12h', format: '12-hour', example: '2:30 PM' },
  { id: '24h', format: '24-hour', example: '14:30' },
];

export default function LanguageDateScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t, isRTL } = useLocalization();
  const selectedLanguage = useAppPreferencesStore((s) => s.language);
  const selectedDateFormat = useAppPreferencesStore((s) => s.dateFormat);
  const selectedTimeFormat = useAppPreferencesStore((s) => s.timeFormat);
  const setLanguage = useAppPreferencesStore((s) => s.setLanguage);
  const setDateFormat = useAppPreferencesStore((s) => s.setDateFormat);
  const setTimeFormat = useAppPreferencesStore((s) => s.setTimeFormat);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 250);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('languageAndDate')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color={theme.tint} />
            <Text style={styles.sectionTitle}>{t('language')}</Text>
          </View>
          <View style={styles.optionsList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.optionItem}
                onPress={() => setLanguage(lang.code as 'en' | 'ar')}
              >
                <Text style={[styles.optionText, { textAlign: isRTL ? 'right' : 'left' }]}>{lang.name}</Text>
                {selectedLanguage === lang.code && (
                  <View style={styles.checkIcon}>
                    <Check size={18} color={theme.tint} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={theme.tint} />
            <Text style={styles.sectionTitle}>{t('dateFormat')}</Text>
          </View>
          <View style={styles.optionsList}>
            {dateFormats.map((format) => (
              <TouchableOpacity
                key={format.id}
                style={styles.formatItem}
                onPress={() => setDateFormat(format.id as 'mdy' | 'dmy' | 'ymd')}
              >
                <View>
                  <Text style={styles.formatLabel}>{format.format}</Text>
                  <Text style={styles.formatExample}>{format.example}</Text>
                </View>
                {selectedDateFormat === format.id && (
                  <View style={styles.checkIcon}>
                    <Check size={18} color={theme.tint} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={theme.tint} />
            <Text style={styles.sectionTitle}>{t('timeFormat')}</Text>
          </View>
          <View style={styles.optionsList}>
            {timeFormats.map((format) => (
              <TouchableOpacity
                key={format.id}
                style={styles.formatItem}
                onPress={() => setTimeFormat(format.id as '12h' | '24h')}
              >
                <View>
                  <Text style={styles.formatLabel}>{format.format}</Text>
                  <Text style={styles.formatExample}>{format.example}</Text>
                </View>
                {selectedTimeFormat === format.id && (
                  <View style={styles.checkIcon}>
                    <Check size={18} color={theme.tint} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
        </TouchableOpacity>
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
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  optionsList: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  optionText: {
    fontSize: 15,
    color: theme.text,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  formatLabel: {
    fontSize: 15,
    color: theme.text,
    marginBottom: 2,
  },
  formatExample: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  checkIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    backgroundColor: theme.tint,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
