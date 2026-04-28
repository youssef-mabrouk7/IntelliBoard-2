import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Flag, Tag, Paperclip, List, ChevronRight, Briefcase, Users as UsersIcon, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Project, Team, User } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';
import { uploadToStorage } from '@/services/uploadService';
import { useDateDraftStore } from '@/stores/dateDraftStore';
import { useAttachmentDraftStore } from '@/stores/attachmentDraftStore';
import type { DraftAttachment } from '@/stores/attachmentDraftStore';
import { useSubtaskDraftStore } from '@/stores/subtaskDraftStore';
import { useLocalization } from '@/utils/localization';

const EMPTY_ATTACHMENTS: DraftAttachment[] = [];

export default function CreateTaskScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();
  const [taskName, setTaskName] = useState('Design New Dashboard UI');
  const [description, setDescription] = useState('');
  const dueDraft = useDateDraftStore((s) => s.byContext.task);
  const setDateDraft = useDateDraftStore((s) => s.setDateDraft);
  const todayISO = new Date().toISOString().slice(0, 10);
  const dueDate = dueDraft?.dateISO ?? todayISO;
  const [priority, setPriority] = useState('High');
  const [category, setCategory] = useState('Upload');
  const taskSubtasks = useSubtaskDraftStore((s) => s.byContext.task) ?? [];
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [profiles, teamsData, projectsData, currentProfile] = await Promise.all([
        supabaseService.getProfiles(),
        supabaseService.getTeams(),
        supabaseService.getProjects(),
        supabaseService.getCurrentProfile().catch(() => null),
      ]);
      setUsers(profiles);
      setTeams(teamsData);
      setProjects(projectsData);

      // Defaults: first project/team/user if available.
      setSelectedTeamId((prev) => prev ?? (teamsData[0]?.id ?? null));
      setSelectedProjectId((prev) => prev ?? (projectsData[0]?.id ?? null));
      setSelectedUserId((prev) => prev ?? (currentProfile?.id ?? profiles[0]?.id ?? null));
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
  const taskAttachmentsState = useAttachmentDraftStore((s) => s.byContext.task);
  const taskAttachments = taskAttachmentsState ?? EMPTY_ATTACHMENTS;
  const setDraftAttachments = useAttachmentDraftStore((s) => s.setAttachments);
  const clearDraftSubtasks = useSubtaskDraftStore((s) => s.clearSubtasks);
  const setDraftSubtasks = useSubtaskDraftStore((s) => s.setSubtasks);

  const toUiPriority = (value: string | undefined) => {
    const normalized = String(value ?? '').toLowerCase();
    if (normalized === 'high') return 'High';
    if (normalized === 'low') return 'Low';
    return 'Medium';
  };

  const handleCreate = async () => {
    if (!taskName.trim()) {
      Alert.alert('Validation', 'Task name is required.');
      return;
    }
    try {
      setCreating(true);
      const dbPriority = priority.toLowerCase() as 'high' | 'medium' | 'low';

      const attachmentUrls: string[] = [];
      for (const a of taskAttachments) {
        if (a.type === 'link') {
          attachmentUrls.push(a.uri);
          continue;
        }
        const uploaded = await uploadToStorage({
          bucket: 'attachments',
          file: {
            uri: a.uri,
            name: a.name,
            mimeType: 'image/jpeg',
          },
          folder: 'tasks',
        });
        attachmentUrls.push(uploaded.url);
      }

      const createdTask = await supabaseService.createTask({
        title: taskName.trim(),
        description: description.trim(),
        dueDate,
        priority: dbPriority,
        status: 'inProgress',
        progress: 0,
        category,
        subtasks: taskSubtasks.length,
        projectId: selectedProject?.id ?? undefined,
        teamId: assignedTeam?.id ?? undefined,
        assignees: assignedUser ? [assignedUser] : [],
        attachmentUrls,
      });
      if (taskSubtasks.length > 0) {
        await supabaseService.createTaskSubtasks(
          createdTask.id,
          taskSubtasks.map((s) => ({ title: s.title, completed: s.completed, dueDate: s.dueDate ?? null })),
        );
      }
      setDraftAttachments('task', []);
      clearDraftSubtasks('task');
      Alert.alert('Success', 'Task created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Create Task Failed', error?.message || 'Unknown error.');
    } finally {
      setCreating(false);
    }
  };

  const handleSuggestWithAI = async () => {
    if (!taskName.trim() && !description.trim()) {
      Alert.alert('Missing details', 'Please add a task name or description first.');
      return;
    }
    try {
      setSuggesting(true);
      const suggestion = await supabaseService.getTaskSuggestion({
        title: taskName.trim(),
        description: description.trim(),
        category,
        priority: priority.toLowerCase(),
      });

      if (suggestion.title?.trim() && !taskName.trim()) {
        setTaskName(suggestion.title.trim());
      }
      if (suggestion.description?.trim()) {
        setDescription(suggestion.description.trim());
      }
      if (suggestion.priority) {
        setPriority(toUiPriority(suggestion.priority));
      }
      if (suggestion.category?.trim()) {
        setCategory(suggestion.category.trim());
      }
      if (suggestion.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(suggestion.dueDate)) {
        setDateDraft('task', { dateISO: suggestion.dueDate });
      }
      if (suggestion.subtasks?.length) {
        setDraftSubtasks(
          'task',
          suggestion.subtasks.map((title, idx) => ({
            id: `${Date.now()}-${idx}`,
            title: title.trim(),
            completed: false,
          })),
        );
      }

      if (suggestion.subtasks?.length) {
        Alert.alert('AI Suggestion', `Updated task details and added ${suggestion.subtasks.length} suggested subtasks.`);
      } else {
        Alert.alert('AI Suggestion', 'Task details updated from AI suggestion.');
      }
    } catch (error: any) {
      Alert.alert('AI Suggestion Failed', error?.message || 'Could not get suggestion.');
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('createTask')}</Text>
        <TouchableOpacity style={[styles.createButton, creating && { opacity: 0.7 }]} onPress={handleCreate} disabled={creating}>
          {creating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.createButtonText}>{t('create')}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <TouchableOpacity style={[styles.aiButton, suggesting && { opacity: 0.7 }]} onPress={handleSuggestWithAI} disabled={suggesting}>
            {suggesting ? (
              <ActivityIndicator color={theme.tint} />
            ) : (
              <>
                <Sparkles size={16} color={theme.tint} />
                <Text style={styles.aiButtonText}>Suggest with AI</Text>
              </>
            )}
          </TouchableOpacity>
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
            <ChevronRight size={18} color={theme.textSecondary} />
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
                <ChevronRight size={18} color={theme.textSecondary} />
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
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push({ pathname: '/select-due-date', params: { context: 'task' } })}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Calendar size={18} color={theme.tint} />
                </View>
                <Text style={styles.optionLabel}>Due date</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{dueDate}</Text>
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/select-priority')}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Flag size={18} color={theme.priority.high} />
                </View>
                <Text style={styles.optionLabel}>Priority</Text>
              </View>
              <View style={styles.optionRight}>
                <View style={[styles.priorityBadge, { backgroundColor: theme.priority.high + '20' }]}>
                  <Text style={[styles.priorityText, { color: theme.priority.high }]}>{priority}</Text>
                </View>
                <ChevronRight size={18} color={theme.textSecondary} />
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
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/select-attachment')}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Paperclip size={18} color={theme.status.completed} />
                </View>
                  <Text style={styles.optionLabel}>{t('attachments')}</Text>
              </View>
              <View style={styles.optionRight}>
                <View style={styles.addButton}>
                  <Text style={styles.addButtonText}>{taskAttachments.length} files</Text>
                </View>
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => router.push('/select-subtasks')}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <List size={18} color={theme.tint} />
                </View>
                <View>
                  <Text style={styles.optionLabel}>Subtasks</Text>
                  <Text style={styles.subtaskCount}>{taskSubtasks.length} subtasks added</Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teams</Text>
          <TouchableOpacity style={styles.teamRow} onPress={() => setTeamPickerOpen(true)}>
            <View>
              <Text style={styles.teamName}>{assignedTeam?.name || 'Select team'}</Text>
              <Text style={styles.teamEmail}>{assignedTeam ? `${assignedTeam.memberCount} members` : 'No team selected'}</Text>
            </View>
            <View style={styles.membersRow}>
              {(assignedTeam?.members || []).slice(0, 3).map((member, idx) => (
                <Image
                  key={idx}
                  source={{ uri: member.avatar || 'https://via.placeholder.com/60' }}
                  style={[styles.memberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                />
              ))}
              {(assignedTeam?.memberCount || 0) > 3 && (
                <View style={styles.moreBadge}>
                  <Text style={styles.moreText}>+{(assignedTeam?.memberCount || 0) - 3}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
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
  createButton: {
    backgroundColor: theme.tint,
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
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.tint,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.text,
  },
  section: {
    backgroundColor: theme.cardSecondary,
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
    borderBottomColor: theme.border,
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
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  modalRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalRowText: {
    fontSize: 15,
    color: theme.text,
    fontWeight: '600',
  },
  assigneeName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  assigneeEmail: {
    fontSize: 13,
    color: theme.textSecondary,
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
    borderBottomColor: theme.border,
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
    color: theme.text,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionValue: {
    fontSize: 14,
    color: theme.textSecondary,
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
    color: theme.tint,
  },
  subtaskCount: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  teamEmail: {
    fontSize: 13,
    color: theme.textSecondary,
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
    borderColor: theme.cardSecondary,
  },
  moreBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '500',
  },
});
