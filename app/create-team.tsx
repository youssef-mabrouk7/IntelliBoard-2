import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { User } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

const teamColors = [
  { color: '#4CAF90', id: 1 },
  { color: '#7B8CDE', id: 2 },
  { color: '#4A7C9B', id: 3 },
  { color: '#9C7BB8', id: 4, selected: true },
  { color: '#E57373', id: 5 },
  { color: null, id: 6 },
];

export default function CreateTeamScreen() {
  const params = useLocalSearchParams<{ memberIds?: string }>();
  const [teamName, setTeamName] = useState('Design Team');
  const [description, setDescription] = useState('UI/UX Designers working on user interface design');
  const [selectedColor, setSelectedColor] = useState(4);
  const [members, setMembers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    const load = async () => setMembers((await supabaseService.getProfiles()).slice(0, 2));
    load();
  }, []);

  useEffect(() => {
    const rawIds = String(params.memberIds || '').trim();
    if (!rawIds) return;
    const ids = rawIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (!ids.length) return;
    const run = async () => {
      const allUsers = await supabaseService.getProfiles();
      const selectedUsers = allUsers.filter((u) => ids.includes(u.id));
      setMembers(selectedUsers);
    };
    run();
  }, [params.memberIds]);

  const handleCreate = async () => {
    if (!teamName.trim()) {
      Alert.alert('Validation', 'Team name is required.');
      return;
    }

    try {
      setCreating(true);
      const color = teamColors.find((c) => c.id === selectedColor)?.color || '#9C7BB8';
      await supabaseService.createTeam(
        {
          name: teamName.trim(),
          description: description.trim(),
          color: color || '#9C7BB8',
          progress: 0,
        },
        members.map((m) => m.id),
      );
      Alert.alert('Success', 'Team created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Create Team Failed', error?.message || 'Unknown error.');
    } finally {
      setCreating(false);
    }
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Team</Text>
        <TouchableOpacity style={[styles.createButton, creating && styles.createButtonDisabled]} onPress={handleCreate} disabled={creating}>
          {creating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.createButtonText}>Create</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Team Name</Text>
            <TextInput
              style={styles.textInput}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter team name"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter team description"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Color</Text>
          <View style={styles.colorRow}>
            {teamColors.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.colorCircle,
                  item.color ? { backgroundColor: item.color } : styles.removeColor,
                  selectedColor === item.id && styles.colorCircleSelected,
                ]}
                onPress={() => item.color && setSelectedColor(item.id)}
              >
                {selectedColor === item.id && item.color && (
                  <Check size={18} color="#FFFFFF" />
                )}
                {!item.color && <X size={18} color={Colors.light.textSecondary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <TouchableOpacity
            style={styles.addMemberButton}
            onPress={() =>
              router.push({
                pathname: '/add-member',
                params: {
                  selectedIds: members.map((m) => m.id).join(','),
                },
              })
            }
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addMemberText}>Add Member</Text>
          </TouchableOpacity>

          <View style={styles.membersList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMember(member.id)}
                >
                  <X size={18} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  createButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  inputSection: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  section: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  removeColor: {
    backgroundColor: Colors.light.border,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 8,
  },
  addMemberText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
