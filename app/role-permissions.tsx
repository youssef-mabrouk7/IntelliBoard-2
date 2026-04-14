import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { User as AppUser } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

const permissions = [
  { id: '1', label: 'Manage Projects', enabled: true, type: 'main' },
  { id: '2', label: 'Manage Tasks', enabled: true, type: 'main' },
  { id: '3', label: 'Manage Teams', enabled: true, type: 'main' },
  { id: '4', label: 'Manage Member', enabled: true, type: 'main' },
  { id: '5', label: 'Create Tasks', enabled: false, type: 'sub' },
  { id: '6', label: 'Edit Tasks', enabled: false, type: 'sub' },
  { id: '7', label: 'Delete Tasks', enabled: false, type: 'sub' },
  { id: '8', label: 'Mark Complete', enabled: false, type: 'sub' },
];

export default function RolePermissionsScreen() {
  const [perms, setPerms] = useState(permissions);
  const [profile, setProfile] = useState<AppUser | null>(null);
  useEffect(() => {
    const load = async () => setProfile(await supabaseService.getCurrentProfile());
    load();
  }, []);

  const togglePermission = (id: string) => {
    setPerms(perms.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleDone = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Role & Permissions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Image source={{ uri: profile?.avatar || 'https://via.placeholder.com/120' }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile?.name || 'User'}</Text>
            <Text style={styles.email}>{profile?.email || 'No email'}</Text>
          </View>
        </View>

        <View style={styles.roleRow}>
          <Text style={styles.roleLabel}>Role</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>manager</Text>
          </View>
        </View>

        <View style={styles.permissionsList}>
          {perms.map((perm) => (
            <View
              key={perm.id}
              style={[
                styles.permissionRow,
                perm.type === 'main' && styles.mainPermission,
              ]}
            >
              {perm.type === 'main' ? (
                <View style={styles.mainPermissionBadge}>
                  <Text style={styles.mainPermissionText}>{perm.label}</Text>
                </View>
              ) : (
                <Text style={styles.subPermissionText}>{perm.label}</Text>
              )}
              <Switch
                value={perm.enabled}
                onValueChange={() => togglePermission(perm.id)}
                trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.doneButtonText}>Done</Text>
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
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  roleBadge: {
    backgroundColor: Colors.light.tint + '30',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  permissionsList: {
    paddingHorizontal: 16,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  mainPermission: {
    marginBottom: 8,
  },
  mainPermissionBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mainPermissionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subPermissionText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 30,
    gap: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
