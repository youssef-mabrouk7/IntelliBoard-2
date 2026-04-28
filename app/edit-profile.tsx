import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabaseService } from '@/services/supabaseService';
import { User as AppUser } from '@/constants/types';
import { useLocalization } from '@/utils/localization';
import { EditableAvatar } from '@/components/EditableAvatar';
import { useAppPreferencesStore } from '@/stores/appPreferencesStore';

const LANGUAGE_LABELS: Record<'en' | 'ar', string> = {
  en: 'English',
  ar: 'Arabic',
};

export default function EditProfileScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();
  const [profile, setProfile] = useState<AppUser | null>(null);
  const appLanguage = useAppPreferencesStore((s) => s.language);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: 'Product Manager',
    email: 'mark@example.com',
    phone: '+20 111 222 3333',
    department: 'Development',
    role: 'Team Member',
    emailNotification: true,
    taskAssignmentAlerts: true,
    deadlineReminder: true,
    timeZone: 'GMT +2: Cairo',
    language: LANGUAGE_LABELS[appLanguage],
  });

  useEffect(() => {
    const loadProfile = async () => {
      const data = await supabaseService.getCurrentProfile();
      if (data) {
        setProfile(data);
        setFormData((prev) => ({
          ...prev,
          fullName: data.name || '',
          jobTitle: data.jobTitle || prev.jobTitle,
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || prev.department,
          role: data.role || prev.role,
        }));
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      language: LANGUAGE_LABELS[appLanguage],
    }));
  }, [appLanguage]);

  const handleSave = () => {
    const run = async () => {
      try {
        setSaving(true);
        const normalizedRole = (() => {
          const role = formData.role.trim().toLowerCase();
          if (role === 'project manager' || role === 'product manager') return 'Project Manager';
          if (role === 'team leader') return 'Team Leader';
          return 'Team Member';
        })();
        await supabaseService.updateCurrentProfile({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          role: normalizedRole,
          jobTitle: formData.jobTitle,
          avatar: profile?.avatar,
        });
        router.back();
      } catch (error: any) {
        Alert.alert('Save Failed', error?.message || 'Could not save profile.');
      } finally {
        setSaving(false);
      }
    };
    run();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editProfile')}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{t('save')}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <EditableAvatar
            value={profile?.avatar}
            disabled={saving}
            onUploaded={async (url) => {
              const previous = profile?.avatar ?? null;
              setProfile((p) => (p ? { ...p, avatar: url } : p));
              try {
                await supabaseService.updateCurrentProfile({ avatar: url });
              } catch (e) {
                setProfile((p) => (p ? { ...p, avatar: previous || '' } : p));
                throw e;
              }
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('fullName')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textSecondary}
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('jobTitle')}</Text>
            <TextInput
              style={styles.input}
              value={formData.jobTitle}
              onChangeText={(text) => setFormData({ ...formData, jobTitle: text })}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('email')}</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('phone')}</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Information</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('department')}</Text>
            <TextInput style={styles.input} value={formData.department} onChangeText={(text) => setFormData({ ...formData, department: text })} />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('role')}</Text>
            <TextInput style={styles.input} value={formData.role} onChangeText={(text) => setFormData({ ...formData, role: text })} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preference</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Email Notification</Text>
            <Switch
              value={formData.emailNotification}
              onValueChange={(value) => setFormData({ ...formData, emailNotification: value })}
              trackColor={{ false: theme.border, true: theme.tint }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Task Assignment Alerts</Text>
            <Switch
              value={formData.taskAssignmentAlerts}
              onValueChange={(value) => setFormData({ ...formData, taskAssignmentAlerts: value })}
              trackColor={{ false: theme.border, true: theme.tint }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Deadline Reminder</Text>
            <Switch
              value={formData.deadlineReminder}
              onValueChange={(value) => setFormData({ ...formData, deadlineReminder: value })}
              trackColor={{ false: theme.border, true: theme.tint }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Time Zone</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>{formData.timeZone}</Text>
              <ChevronDown size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Language</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>{formData.language}</Text>
              <ChevronDown size={18} color={theme.textSecondary} />
            </TouchableOpacity>
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
  saveButton: {
    backgroundColor: theme.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  inputLabel: {
    fontSize: 15,
    color: theme.text,
    flex: 1,
  },
  input: {
    flex: 1.5,
    fontSize: 15,
    color: theme.text,
    textAlign: 'right',
    paddingVertical: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectText: {
    fontSize: 15,
    color: theme.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  toggleLabel: {
    fontSize: 15,
    color: theme.text,
  },
});
