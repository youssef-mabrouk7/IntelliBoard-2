import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { Task, TaskSubtask } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

type SubtaskWithTask = TaskSubtask & { taskTitle: string };

export default function AllSubtasksScreen() {
  const [loading, setLoading] = useState(true);
  const [subtasks, setSubtasks] = useState<SubtaskWithTask[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const tasks = await supabaseService.getTasks();
        const all = await Promise.all(
          tasks.map(async (task: Task) => {
            const rows = await supabaseService.getTaskSubtasks(task.id);
            return rows.map((row) => ({ ...row, taskTitle: task.title }));
          }),
        );
        setSubtasks(all.flat());
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subtasks</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.tint} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {subtasks.length === 0 ? (
            <Text style={styles.emptyText}>No subtasks available.</Text>
          ) : (
            subtasks.map((subtask) => (
              <View key={subtask.id} style={styles.card}>
                <View style={styles.row}>
                  {subtask.completed ? (
                    <CheckCircle2 size={18} color={Colors.light.status.completed} />
                  ) : (
                    <Circle size={18} color={Colors.light.textSecondary} />
                  )}
                  <Text style={styles.title}>{subtask.title}</Text>
                </View>
                <Text style={styles.meta}>Task: {subtask.taskTitle}</Text>
                <Text style={styles.meta}>Due: {subtask.dueDate ?? 'Not set'}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.light.tintDark },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.light.textSecondary, fontSize: 14, fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.cardSecondary,
    padding: 12,
    gap: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: Colors.light.text, fontSize: 14, fontWeight: '700' },
  meta: { color: Colors.light.textSecondary, fontSize: 12, fontWeight: '600' },
});
