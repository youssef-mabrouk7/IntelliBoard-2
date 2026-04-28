import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, HelpCircle, MessageCircle, FileText, Mail, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLocalization } from '@/utils/localization';

const quickLinks = [
  'Getting Started',
  'Managing Tasks',
  'Team Collaboration',
  'Account Settings',
  'Billing & Plans',
];

export default function HelpSupportScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();

  const supportOptions = [
    {
      icon: HelpCircle,
      title: 'FAQs',
      description: 'Find answers to common questions',
      color: theme.tint,
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      color: '#4CAF90',
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Browse our help articles',
      color: '#9C7BB8',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email',
      color: '#FFB74D',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('helpSupportLabel')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.optionsGrid}>
          {supportOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionCard}>
              <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                <option.icon size={24} color={option.color} />
              </View>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('languageAndDate')}</Text>
          <View style={styles.linksList}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity key={index} style={styles.linkItem}>
                <Text style={styles.linkText}>{link}</Text>
                <ChevronRight size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactDescription}>
            Our support team is available 24/7 to assist you
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Us</Text>
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    width: '47%',
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  linksList: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  linkText: {
    fontSize: 15,
    color: theme.text,
  },
  contactSection: {
    marginHorizontal: 16,
    marginBottom: 30,
    padding: 24,
    backgroundColor: theme.tint + '10',
    borderRadius: 16,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: theme.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
