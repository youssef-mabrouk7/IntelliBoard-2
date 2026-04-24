import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Users, Check, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabaseService } from '@/services/supabaseService';
import { useDateDraftStore } from '@/stores/dateDraftStore';
import type { Team } from '@/constants/types';

const PROJECT_COLORS = [
  '#4A7C9B', '#9C7BB8', '#4CAF90', '#E57373', '#FFB74D', '#7B8CDE', '#64B5F6',
];

export default function NewProjectScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const dueDraft = useDateDraftStore((s) => s.byContext.project);
  const todayISO = new Date().toISOString().slice(0, 10);
  const dueDate = dueDraft?.dateISO ?? todayISO;
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);

  useEffect(() => {
    supabaseService.getTeams().then(setTeams).catch(() => {});
  }, []);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const handleCreate = async () => {
    if (!projectName.trim()) {
      Alert.alert('Validation', 'Project name is required.');
      return;
    }
    try {
      setCreating(true);
      await supabaseService.createProject({
        name: projectName.trim(),
        description: description.trim(),
        dueDate,
        progress: 0,
        status: 'active',
        color: selectedColor,
        tasks: 0,
        members: [],
      });
      Alert.alert('Success', 'Project created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Create Project Failed', error?.message || 'Unknown error.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Project</Text>
        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.createButtonText}>Create</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Name + Description */}
        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Project Name</Text>
            <TextInput
              style={styles.textInput}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Enter project name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your project..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Color picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Color</Text>
          <View style={styles.colorRow}>
            {PROJECT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorCircleSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && <Check size={18} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date</Text>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => router.push({ pathname: '/select-due-date', params: { context: 'project' } })}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Calendar size={20} color={theme.tint} />
            </View>
            <Text style={styles.optionValue}>{dueDate}</Text>
            <ChevronRight size={18} color={theme.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Team picker — replaces member selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team</Text>
          <TouchableOpacity style={styles.optionRow} onPress={() => setTeamPickerOpen(true)}>
            <View style={[styles.optionIcon, { backgroundColor: '#E8EAF6' }]}>
              <Users size={20} color="#7B8CDE" />
            </View>
            <Text style={styles.optionValue}>
              {selectedTeam ? selectedTeam.name : 'Select a team (optional)'}
            </Text>
            <ChevronRight size={18} color={theme.textSecondary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Team picker modal */}
      <Modal
        visible={teamPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTeamPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTeamPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Team</Text>
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.modalRow}
                onPress={() => { setSelectedTeamId(null); setTeamPickerOpen(false); }}
              >
                <Text style={[styles.modalRowText, !selectedTeamId && { color: theme.tint }]}>
                  None
                </Text>
                {!selectedTeamId && <Check size={16} color={theme.tint} />}
              </TouchableOpacity>
              {teams.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.modalRow}
                  onPress={() => { setSelectedTeamId(t.id); setTeamPickerOpen(false); }}
                >
                  <View style={[styles.modalTeamDot, { backgroundColor: t.color || theme.tint }]} />
                  <Text style={[styles.modalRowText, selectedTeamId === t.id && { color: theme.tint }]}>
                    {t.name}{t.memberCount ? ` (${t.memberCount} members)` : ''}
                  </Text>
                  {selectedTeamId === t.id && <Check size={16} color={theme.tint} />}
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
    minWidth: 70,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButtonDisabled: { opacity: 0.7 },
  inputSection: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  inputGroup: { marginBottom: 16 },
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
    borderWidth: 1,
    borderColor: theme.border,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
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
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionValue: {
    fontSize: 15,
    color: theme.text,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 14,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTeamDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modalRowText: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    fontWeight: '600',
  },
});
