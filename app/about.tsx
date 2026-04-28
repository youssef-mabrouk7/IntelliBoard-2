import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Github, Globe, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLocalization } from '@/utils/localization';

const appInfo = [
  { label: 'Version', value: '2.1.0' },
  { label: 'Build', value: '2024.03.15' },
  { label: 'Platform', value: 'React Native' },
];

const legalLinks = [
  'Privacy Policy',
  'Terms of Service',
  'Licenses',
];

export default function AboutScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();

  const appInfo = [
    { label: t('version'), value: '2.1.0' },
    { label: 'Build', value: '2024.03.15' },
    { label: 'Platform', value: 'React Native' },
  ];

  const legalLinks = [
    t('privacyPolicy'),
    t('termsOfService'),
    t('licenses'),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aboutTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>IB</Text>
          </View>
          <Text style={styles.appName}>IntelliBoard</Text>
          <Text style={styles.tagline}>{t('smartProjectManagement')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('appInformation')}</Text>
          <View style={styles.infoList}>
            {appInfo.map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('legal')}</Text>
          <View style={styles.linksList}>
            {legalLinks.map((link, index) => (
              <TouchableOpacity key={index} style={styles.linkItem}>
                <Text style={styles.linkText}>{link}</Text>
                <ChevronRight size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('connect')}</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <Globe size={24} color={theme.tint} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Github size={24} color={theme.tint} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Heart size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with <Heart size={14} color={theme.error} fill={theme.error} /> by IntelliBoard Team
          </Text>
          <Text style={styles.copyright}>2024 IntelliBoard. All rights reserved.</Text>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: theme.textSecondary,
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
  infoList: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.text,
  },
  infoValue: {
    fontSize: 15,
    color: theme.textSecondary,
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
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: theme.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: theme.textMuted,
  },
});
