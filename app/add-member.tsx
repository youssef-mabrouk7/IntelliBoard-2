import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Check, UserPlus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { User } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

interface UserWithSelected {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
  department?: string;
  jobTitle?: string;
  phone?: string;
  selected: boolean;
}

export default function AddMemberScreen() {
  const params = useLocalSearchParams<{ selectedIds?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [userList, setUserList] = useState<UserWithSelected[]>([]);

  useEffect(() => {
    const load = async () => {
      const users: User[] = await supabaseService.getProfiles();
      const selectedIds = String(params.selectedIds || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      setUserList(users.map((u) => ({ ...u, selected: selectedIds.includes(u.id) })));
    };
    load();
  }, [params.selectedIds]);

  const toggleUser = (id: string) => {
    setUserList(userList.map(u => 
      u.id === id ? { ...u, selected: !u.selected } : u
    ));
  };

  const selectedCount = userList.filter(u => u.selected).length;

  const filteredUsers = userList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const selectedIds = userList.filter((u) => u.selected).map((u) => u.id).join(',');
    router.replace({
      pathname: '/create-team',
      params: { memberIds: selectedIds },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Members</Text>
        <TouchableOpacity 
          style={[styles.addButton, selectedCount === 0 && styles.addButtonDisabled]} 
          onPress={handleAdd}
          disabled={selectedCount === 0}
        >
          <Text style={styles.addButtonText}>Add ({selectedCount})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Users</Text>
          <View style={styles.usersList}>
            {filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userCard, user.selected && styles.userCardSelected]}
                onPress={() => toggleUser(user.id)}
              >
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={[styles.checkbox, user.selected && styles.checkboxChecked]}>
                  {user.selected && <Check size={16} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inviteSection}>
          <View style={styles.inviteIcon}>
            <UserPlus size={24} color={Colors.light.tint} />
          </View>
          <Text style={styles.inviteTitle}>Invite by Email</Text>
          <Text style={styles.inviteDescription}>
            Send an invitation link to someone outside your organization
          </Text>
          <TouchableOpacity style={styles.inviteButton}>
            <Text style={styles.inviteButtonText}>Send Invite</Text>
          </TouchableOpacity>
        </View>
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
  addButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  usersList: {
    gap: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userCardSelected: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.cardSecondary,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  inviteSection: {
    marginHorizontal: 16,
    marginTop: 30,
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  inviteIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  inviteDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  inviteButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  inviteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
