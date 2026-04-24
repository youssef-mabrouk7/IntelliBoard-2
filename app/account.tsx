import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Phone, Lock, Shield, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { User as AppUser } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

export default function AccountScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [profile, setProfile] = useState<AppUser | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await supabaseService.getCurrentProfile();
      setProfile(data);
    };
    loadProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image source={{ uri: profile?.avatar || 'https://via.placeholder.com/120' }} style={styles.avatar} />
          <Text style={styles.name}>{profile?.name || 'User'}</Text>
          <Text style={styles.email}>{profile?.email || 'No email'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <View style={[styles.infoIcon, { backgroundColor: theme.tint + '20' }]}>
                <Mail size={18} color={theme.tint} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile?.email || 'No email'}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <View style={[styles.infoIcon, { backgroundColor: theme.status.completed + '20' }]}>
                <Phone size={18} color={theme.status.completed} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>+1 234 567 890</Text>
              </View>
            </View>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <View style={[styles.infoIcon, { backgroundColor: theme.warning + '20' }]}>
                <Lock size={18} color={theme.warning} />
              </View>
              <Text style={styles.infoLabel}>Change Password</Text>
            </View>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={styles.toggleItem}>
            <View style={styles.infoLeft}>
              <View style={[styles.infoIcon, { backgroundColor: '#E8EAF6' }]}>
                <Shield size={18} color="#7B8CDE" />
              </View>
              <Text style={styles.infoLabel}>Two-Factor Authentication</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: theme.border, true: theme.tint }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.infoLeft}>
              <View style={[styles.infoIcon, { backgroundColor: '#F3E5F5' }]}>
                <Lock size={18} color="#9C27B0" />
              </View>
              <Text style={styles.infoLabel}>Biometric Login</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: theme.border, true: theme.tint }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  section: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.text,
  },
  infoValue: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.error + '15',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.error,
  },
});
