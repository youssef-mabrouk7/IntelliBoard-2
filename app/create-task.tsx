import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Flag, Tag, Paperclip, List, ChevronRight, Briefcase, Users as UsersIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Project, Team, User } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';
import { useDateDraftStore } from '@/stores/dateDraftStore';

export default function CreateTaskScreen() {
  const [taskName, setTaskName] = useState('Design New Dashboard UI');
  const [description, setDescription] = useState('');
  const dueDraft = useDateDraftStore((s) => s.byContext.task);
  const todayISO = new Date().toISOString().slice(0, 10);
  const dueDate = dueDraft?.dateISO ?? todayISO;
  const [priority] = useState('High');
  const [category] = useState('Upload');
  const [subtasksCount] = useState(3);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [profiles, teamsData, projectsData] = await Promise.all([
        supabaseService.getProfiles(),
        supabaseService.getTeams(),
        supabaseService.getProjects(),
      ]);
      setUsers(profiles);
      setTeams(teamsData);
      setProjects(projectsData);

      // Defaults: first project/team/user if available.
      setSelectedTeamId((prev) => prev ?? (teamsData[0]?.id ?? null));
      setSelectedProjectId((prev) => prev ?? (projectsData[0]?.id ?? null));
      setSelectedUserId((prev) => prev ?? (profiles[0]?.id ?? null));
    };
    load();
  }, []);

  const selectedTeam = useMemo(
    () => (selectedTeamId ? teams.find((t) => t.id === selectedTeamId) : undefined),
    [teams, selectedTeamId],
  );
  const selectedProject = useMemo(
    () => (selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : undefined),
    [projects, selectedProjectId],
  );

  const availableAssignees = useMemo(() => {
    if (selectedTeam && selectedTeam.members?.length) return selectedTeam.members;
    return users;
  }, [selectedTeam, users]);

  const assignedUser = useMemo(() => {
    const fromId = selectedUserId ? availableAssignees.find((u) => u.id === selectedUserId) : undefined;
    return fromId ?? availableAssignees[0];
  }, [availableAssignees, selectedUserId]);

  const assignedTeam = selectedTeam;
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!taskName.trim()) {
      Alert.alert('Validation', 'Task name is required.');
      return;
    }
    try {
      setCreating(true);
      const dbPriority = priority.toLowerCase() as 'high' | 'medium' | 'low';
      await supabaseService.createTask({
        title: taskName.trim(),
        description: description.trim(),
        dueDate,
        priority: dbPriority,
        status: 'inProgress',
        progress: 0,
        category,
        subtasks: subtasksCount,
        projectId: selectedProject?.id ?? undefined,
        teamId: assignedTeam?.id ?? undefined,
        assignees: assignedUser ? [assignedUser] : [],
      });
      Alert.alert('Success', 'Task created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Create Task Failed', error?.message || 'Unknown error.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Task</Text>
        <TouchableOpacity style={[styles.createButton, creating && { opacity: 0.7 }]} onPress={handleCreate} disabled={creating}>
          {creating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.createButtonText}>Create</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Task Name</Text>
            <TextInput
              style={styles.textInput}
              value={taskName}
              onChangeText={setTaskName}
              placeholder="Enter task name"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Write a description for the task..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.assigneeRow} onPress={() => setAssigneePickerOpen(true)}>
            <Image source={{ uri: assignedUser?.avatar || 'https://via.placeholder.com/100' }} style={styles.assigneeAvatar} />
            <View style={styles.assigneeInfo}>
              <Text style={styles.assigneeName}>{assignedUser?.name || 'Unassigned'}</Text>
              <Text style={styles.assigneeEmail}>{assignedUser?.email || 'No email'}</Text>
            </View>
            <ChevronRight size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <View style={styles.optionsList}>
            <TouchableOpacity style={styles.optionRow} onPress={() => setProjectPickerOpen(true)}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8EAF6' }]}>
                  <Briefcase size={18} color="#7B8CDE" />
                </View>
                <Text style={styles.optionLabel}>Project</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{selectedProject?.name || 'None'}</Text>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => setTeamPickerOpen(true)}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#FFF3E0' }]}>
                  <UsersIcon size={18} color="#FFB74D" />
                </View>
                <Text style={styles.optionLabel}>Team</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{assignedTeam?.name || 'None'}</Text>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push({ pathname: '/select-due-date', params: { context: 'task' } })}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Calendar size={18} color={Colors.light.tint} />
                </View>
                <Text style={styles.optionLabel}>Due date</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{dueDate}</Text>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/select-priority')}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Flag size={18} color={Colors.light.priority.high} />
                </View>
                <Text style={styles.optionLabel}>Priority</Text>
              </View>
              <View style={styles.optionRight}>
                <View style={[styles.priorityBadge, { backgroundColor: Colors.light.priority.high + '20' }]}>
                  <Text style={[styles.priorityText, { color: Colors.light.priority.high }]}>{priority}</Text>
                </View>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/select-category')}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8EAF6' }]}>
                  <Tag size={18} color="#7B8CDE" />
                </View>
                <Text style={styles.optionLabel}>category</Text>
              </View>
              <View style={styles.optionRight}>
                <View style={[styles.categoryBadge, { backgroundColor: '#E8EAF6' }]}>
                  <Text style={[styles.categoryText, { color: '#7B8CDE' }]}>{category}</Text>
                </View>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/select-attachment')}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Paperclip size={18} color={Colors.light.status.completed} />
                </View>
                <Text style={styles.optionLabel}>Attachments</Text>
              </View>
              <View style={styles.optionRight}>
                <View style={styles.addButton}>
                  <Text style={styles.addButtonText}>2 files</Text>
                </View>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/select-subtasks')}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <List size={18} color={Colors.light.tint} />
                </View>
                <View>
                  <Text style={styles.optionLabel}>Subtasks</Text>
                  <Text style={styles.subtaskCount}>{subtasksCount} subtasks added</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teams</Text>
          <View style={styles.teamRow}>
            <View>
              <Text style={styles.teamName}>{assignedTeam?.name || 'No team'}</Text>
              <Text style={styles.teamEmail}>{assignedUser?.email || 'No email'}</Text>
            </View>
            <View style={styles.membersRow}>
              {(assignedTeam?.members || []).slice(0, 3).map((member, idx) => (
                <Image
                  key={idx}
                  source={{ uri: member.avatar || 'https://via.placeholder.com/60' }}
                  style={[styles.memberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                />
              ))}
              <View style={styles.moreBadge}>
                <Text style={styles.moreText}>+5</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={projectPickerOpen} transparent animationType="fade" onRequestClose={() => setProjectPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setProjectPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Project</Text>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.modalRow}
                onPress={() => {
                  setSelectedProjectId(null);
                  setProjectPickerOpen(false);
                }}
              >
                <Text style={styles.modalRowText}>None</Text>
              </TouchableOpacity>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.modalRow}
                  onPress={() => {
                    setSelectedProjectId(p.id);
                    setProjectPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalRowText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={teamPickerOpen} transparent animationType="fade" onRequestClose={() => setTeamPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setTeamPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Team</Text>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.modalRow}
                onPress={() => {
                  setSelectedTeamId(null);
                  setTeamPickerOpen(false);
                }}
              >
                <Text style={styles.modalRowText}>None</Text>
              </TouchableOpacity>
              {teams.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.modalRow}
                  onPress={() => {
                    setSelectedTeamId(t.id);
                    // When switching teams, pick the first team member (if any) as default assignee.
                    const firstMember = t.members?.[0];
                    setSelectedUserId(firstMember?.id ?? null);
                    setTeamPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalRowText}>
                    {t.name} {t.memberCount ? `(${t.memberCount})` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={assigneePickerOpen} transparent animationType="fade" onRequestClose={() => setAssigneePickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAssigneePickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Assignee</Text>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.modalRow}
                onPress={() => {
                  setSelectedUserId(null);
                  setAssigneePickerOpen(false);
                }}
              >
                <Text style={styles.modalRowText}>Unassigned</Text>
              </TouchableOpacity>
              {availableAssignees.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.modalRow}
                  onPress={() => {
                    setSelectedUserId(u.id);
                    setAssigneePickerOpen(false);
                  }}
                >
                  <Text style={styles.modalRowText}>{u.name || u.email}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  assigneeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  assigneeInfo: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  modalRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalRowText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '600',
  },
  assigneeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  assigneeEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  optionsList: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 15,
    color: Colors.light.text,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionValue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  subtaskCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  teamEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.cardSecondary,
  },
  moreBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});
