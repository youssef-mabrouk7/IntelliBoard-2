import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Bell, Palette, CheckCircle, HelpCircle, Info, Globe, LogOut, ChevronRight, Mail, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabaseService } from '@/services/supabaseService';
import { User as AppUser } from '@/constants/types';
import { supabase } from '@/utils/supabase';

const settingsItems = [
  { icon: User, label: 'Account', color: Colors.light.tint, route: '/account' },
  { icon: Bell, label: 'Notifications', color: '#FF9800', route: '/notifications-settings' },
  { icon: Palette, label: 'Appearance', color: '#9C27B0', route: '/appearance' },
  { icon: CheckCircle, label: 'Preferences', color: '#4CAF50', route: '/preferences' },
  { icon: HelpCircle, label: 'Help & Support', color: Colors.light.tint, route: '/help-support' },
  { icon: Info, label: 'About', color: Colors.light.tint, route: '/about' },
  { icon: Globe, label: 'Language & Date', color: Colors.light.text, route: '/language-date' },
];

export default function SettingsScreen() {
  const [testingConnection, setTestingConnection] = React.useState(false);
  const [profile, setProfile] = React.useState<AppUser | null>(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await supabaseService.getCurrentProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const result = await supabaseService.testConnection();
      Alert.alert(
        result.connected ? 'Supabase Connected' : 'Supabase Not Connected',
        result.message,
      );
    } catch (error) {
      Alert.alert(
        'Supabase Not Connected',
        error instanceof Error ? error.message : 'Unknown connection error.',
      );
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/profile')}>
          <Image source={{ uri: profile?.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || 'User'}</Text>
            <Text style={styles.email}>{profile?.email || 'No email'}</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push('/edit-profile')}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.settingsList}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.settingsItem}
              onPress={() => (router as { push: (path: string) => void }).push(item.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <item.icon size={20} color={item.color} />
              </View>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <ChevronRight size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.settingsItem, styles.logoutItem]}
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
              <LogOut size={20} color={Colors.light.error} />
            </View>
            <Text style={[styles.itemLabel, { color: Colors.light.error }]}>Logout</Text>
            <ChevronRight size={20} color={Colors.light.error} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.testConnectionButton}
          onPress={handleTestConnection}
          disabled={testingConnection}
        >
          {testingConnection ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.testConnectionText}>Test Supabase Connection</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.inviteButton} onPress={() => router.push('/invite-email')}>
          <Mail size={20} color="#FFFFFF" />
          <Plus size={16} color="#FFFFFF" style={styles.plusIcon} />
          <Text style={styles.inviteButtonText}>Invite With Email</Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsList: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 30,
  },
  testConnectionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tintDark,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 16,
  },
  testConnectionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  plusIcon: {
    marginLeft: -8,
    marginRight: 8,
  },
  inviteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
