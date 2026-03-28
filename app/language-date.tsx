import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Globe, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';

const languages = [
  { code: 'en', name: 'English', flag: '' },
  { code: 'es', name: 'Spanish', flag: '' },
  { code: 'fr', name: 'French', flag: '' },
  { code: 'de', name: 'German', flag: '' },
  { code: 'it', name: 'Italian', flag: '' },
  { code: 'pt', name: 'Portuguese', flag: '' },
  { code: 'zh', name: 'Chinese', flag: '' },
  { code: 'ja', name: 'Japanese', flag: '' },
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedDateFormat, setSelectedDateFormat] = useState('mdy');
  const [selectedTimeFormat, setSelectedTimeFormat] = useState('12h');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language & Date</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>Language</Text>
          </View>
          <View style={styles.optionsList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.optionItem}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <Text style={styles.optionText}>{lang.name}</Text>
                {selectedLanguage === lang.code && (
                  <View style={styles.checkIcon}>
                    <Check size={18} color={Colors.light.tint} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>Date Format</Text>
          </View>
          <View style={styles.optionsList}>
            {dateFormats.map((format) => (
              <TouchableOpacity
                key={format.id}
                style={styles.formatItem}
                onPress={() => setSelectedDateFormat(format.id)}
              >
                <View>
                  <Text style={styles.formatLabel}>{format.format}</Text>
                  <Text style={styles.formatExample}>{format.example}</Text>
                </View>
                {selectedDateFormat === format.id && (
                  <View style={styles.checkIcon}>
                    <Check size={18} color={Colors.light.tint} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>Time Format</Text>
          </View>
          <View style={styles.optionsList}>
            {timeFormats.map((format) => (
              <TouchableOpacity
                key={format.id}
                style={styles.formatItem}
                onPress={() => setSelectedTimeFormat(format.id)}
              >
                <View>
                  <Text style={styles.formatLabel}>{format.format}</Text>
                  <Text style={styles.formatExample}>{format.example}</Text>
                </View>
                {selectedTimeFormat === format.id && (
                  <View style={styles.checkIcon}>
                    <Check size={18} color={Colors.light.tint} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.tintDark,
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
    color: Colors.light.text,
  },
  optionsList: {
    backgroundColor: Colors.light.cardSecondary,
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
    borderBottomColor: Colors.light.border,
  },
  optionText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  formatLabel: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 2,
  },
  formatExample: {
    fontSize: 13,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.tint,
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
