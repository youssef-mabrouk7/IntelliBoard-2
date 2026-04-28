import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Check, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSubtaskDraftStore } from '@/stores/subtaskDraftStore';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string | null;
}

export default function SelectSubtasksScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const draftSubtasks = useSubtaskDraftStore((s) => s.byContext.task) ?? [];
  const setDraftSubtasks = useSubtaskDraftStore((s) => s.setSubtasks);
  const [subtasks, setSubtasks] = useState<Subtask[]>(
    draftSubtasks.length > 0 ? draftSubtasks : [],
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false,
        dueDate: null,
      }]);
      setNewSubtaskTitle('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleSave = () => {
    setDraftSubtasks('task', subtasks);
    router.back();
  };

  const completedCount = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subtasks</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressText}>{completedCount} of {subtasks.length} completed</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
        </View>

        <View style={styles.subtasksSection}>
          <Text style={styles.sectionTitle}>Subtasks ({subtasks.length})</Text>
          
          <View style={styles.subtasksList}>
            {subtasks.map((subtask) => (
              <View key={subtask.id} style={styles.subtaskItem}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    subtask.completed && styles.checkboxChecked,
                  ]}
                  onPress={() => toggleSubtask(subtask.id)}
                >
                  {subtask.completed && <Check size={14} color="#FFFFFF" />}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.subtaskTitle,
                    subtask.completed && styles.subtaskTitleCompleted,
                  ]}
                >
                  {subtask.title}
                </Text>
                <TextInput
                  style={styles.subtaskDueDateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textSecondary}
                  value={subtask.dueDate ?? ''}
                  onChangeText={(value) =>
                    setSubtasks((prev) =>
                      prev.map((item) =>
                        item.id === subtask.id ? { ...item, dueDate: value.trim() || null } : item,
                      ),
                    )
                  }
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeSubtask(subtask.id)}
                >
                  <Trash2 size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add New Subtask</Text>
          <View style={styles.addInputRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Enter subtask title..."
              placeholderTextColor={theme.textSecondary}
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              onSubmitEditing={addSubtask}
            />
            <TouchableOpacity style={styles.addButton} onPress={addSubtask}>
              <Plus size={24} color="#FFFFFF" />
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
  progressSection: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  progressText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: theme.tint,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    minWidth: 36,
  },
  subtasksSection: {
    paddingHorizontal: 16,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  subtasksList: {
    gap: 12,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: theme.tint,
    borderColor: theme.tint,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
  },
  subtaskDueDateInput: {
    width: 110,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: theme.text,
    marginRight: 8,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.textSecondary,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSection: {
    paddingHorizontal: 16,
    marginTop: 30,
    paddingBottom: 30,
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addInput: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
