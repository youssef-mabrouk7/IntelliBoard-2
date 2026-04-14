import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { User } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

export default function InviteMembersScreen() {
  const [activeTab, setActiveTab] = useState<'All' | 'Suggested'>('Suggested');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(['1']);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => setUsers(await supabaseService.getProfiles());
    load();
  }, []);

  const toggleMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(m => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleSend = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Members</Text>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'All' && styles.tabActive]}
            onPress={() => setActiveTab('All')}
          >
            <Text style={[styles.tabText, activeTab === 'All' && styles.tabTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Suggested' && styles.tabActive]}
            onPress={() => setActiveTab('Suggested')}
          >
            <Text style={[styles.tabText, activeTab === 'Suggested' && styles.tabTextActive]}>Suggested</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.membersList}>
          {users.map((user) => (
            <View key={user.id} style={styles.memberRow}>
              <Image source={{ uri: user.avatar }} style={styles.memberAvatar} />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{user.name}</Text>
                <Text style={styles.memberEmail}>{user.email}</Text>
                {user.id === '4' && (
                  <View style={styles.teamBadge}>
                    <Text style={styles.teamBadgeText}>Design Team</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  selectedMembers.includes(user.id) && styles.addButtonActive,
                ]}
                onPress={() => toggleMember(user.id)}
              >
                {selectedMembers.includes(user.id) ? (
                  <Check size={18} color="#FFFFFF" />
                ) : (
                  <Plus size={18} color={Colors.light.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.inviteEmailButton}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.inviteEmailText}>Invite With Email</Text>
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
  sendButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sendButtonText: {
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
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.cardSecondary,
  },
  tabActive: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  membersList: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  teamBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  teamBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.light.tint,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  inviteEmailButton: {
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
  inviteEmailText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
