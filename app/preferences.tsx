import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLocalization } from '@/utils/localization';

interface PreferenceSection {
  title: string;
  items: {
    id: string;
    label: string;
    value: string;
    hasSwitch?: boolean;
    switchValue?: boolean;
  }[];
}

export default function PreferencesScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();
  const [autoSave, setAutoSave] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  const sections: PreferenceSection[] = [
    {
      title: 'General',
      items: [
        { id: 'language', label: 'Language', value: 'English' },
        { id: 'timezone', label: 'Time Zone', value: 'GMT +2:00' },
        { id: 'date', label: 'Date Format', value: 'MM/DD/YYYY' },
      ],
    },
    {
      title: 'Task Preferences',
      items: [
        { id: 'autosave', label: 'Auto-save Drafts', value: '', hasSwitch: true, switchValue: autoSave },
        { id: 'compact', label: 'Compact View', value: '', hasSwitch: true, switchValue: compactView },
        { id: 'completed', label: 'Show Completed Tasks', value: '', hasSwitch: true, switchValue: showCompleted },
        { id: 'defaultview', label: 'Default View', value: 'List' },
      ],
    },
  ];

  const handleSwitchChange = (id: string, value: boolean) => {
    if (id === 'autosave') setAutoSave(value);
    if (id === 'compact') setCompactView(value);
    if (id === 'completed') setShowCompleted(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('preferencesTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View 
                  key={item.id} 
                  style={[
                    styles.item,
                    itemIndex === section.items.length - 1 && styles.itemLast,
                  ]}
                >
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.hasSwitch ? (
                    <Switch
                      value={item.switchValue}
                      onValueChange={(value) => handleSwitchChange(item.id, value)}
                      trackColor={{ false: theme.border, true: theme.tint }}
                      thumbColor="#FFFFFF"
                    />
                  ) : (
                    <TouchableOpacity style={styles.valueContainer}>
                      <Text style={styles.itemValue}>{item.value}</Text>
                      <ChevronRight size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.resetSection}>
          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
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
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemLabel: {
    fontSize: 15,
    color: theme.text,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemValue: {
    fontSize: 15,
    color: theme.textSecondary,
  },
  resetSection: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  resetButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.cardSecondary,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.error,
  },
});
