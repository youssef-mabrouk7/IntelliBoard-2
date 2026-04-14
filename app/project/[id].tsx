import { useLocalSearchParams, router } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, Calendar, CheckCircle, ListTodo } from 'lucide-react-native'

import Colors from '@/constants/colors'
import type { Project, Task } from '@/constants/types'
import { supabaseService } from '@/services/supabaseService'

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const projectId = Array.isArray(id) ? id[0] : id

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!projectId) return
      try {
        setLoading(true)
        setError(null)
        const [p, ts] = await Promise.all([
          supabaseService.getProjectById(projectId),
          supabaseService.getTasks(projectId),
        ])
        setProject(p)
        setTasks(ts)
      } catch (e: any) {
        setError(e?.message || 'Failed to load project')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  const completedCount = useMemo(() => tasks.filter((t) => t.status === 'completed').length, [tasks])

  if (!projectId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: Colors.light.error }}>Missing project id.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && (
        <View style={{ padding: 16 }}>
          <ActivityIndicator color={Colors.light.tint} />
        </View>
      )}
      {!!error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: Colors.light.error }}>{error}</Text>
        </View>
      )}

      {!loading && !error && project && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>{project.name}</Text>
            {!!project.description && <Text style={styles.description}>{project.description}</Text>}
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Calendar size={18} color={Colors.light.tint} />
              <Text style={styles.rowLabel}>Due</Text>
              <Text style={styles.rowValue}>{project.dueDate || '-'}</Text>
            </View>
            <View style={styles.row}>
              <ListTodo size={18} color="#7B8CDE" />
              <Text style={styles.rowLabel}>Tasks</Text>
              <Text style={styles.rowValue}>
                {tasks.length} total • {completedCount} completed
              </Text>
            </View>
            <View style={styles.row}>
              <CheckCircle size={18} color={Colors.light.status.completed} />
              <Text style={styles.rowLabel}>Progress</Text>
              <Text style={styles.rowValue}>{project.progress}%</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Members</Text>
            {project.members.length === 0 ? (
              <Text style={styles.muted}>No members</Text>
            ) : (
              <View style={styles.membersRow}>
                {project.members.slice(0, 8).map((m, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: m.avatar || 'https://via.placeholder.com/60' }}
                    style={styles.memberAvatar}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Project Tasks</Text>
            {tasks.length === 0 ? (
              <Text style={styles.muted}>No tasks for this project yet.</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {tasks.map((t) => (
                  <TouchableOpacity key={t.id} style={styles.taskRow} onPress={() => router.push(`/task/${t.id}`)}>
                    <View style={styles.taskLeft}>
                      <View style={[styles.dot, { backgroundColor: t.status === 'completed' ? Colors.light.status.completed : Colors.light.tint }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskTitle}>{t.title}</Text>
                        <Text style={styles.taskMeta}>Due: {t.dueDate}</Text>
                      </View>
                    </View>
                    <Text style={styles.taskArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
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
  card: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.light.text, marginBottom: 8 },
  description: { fontSize: 14, color: Colors.light.textSecondary, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  rowLabel: { width: 70, fontSize: 14, color: Colors.light.textSecondary, fontWeight: '600' },
  rowValue: { flex: 1, fontSize: 14, color: Colors.light.text, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.text, marginBottom: 12 },
  muted: { color: Colors.light.textSecondary, fontSize: 14, fontWeight: '600' },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  memberAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.light.border },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  taskTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  taskMeta: { fontSize: 12, fontWeight: '600', color: Colors.light.textSecondary, marginTop: 2 },
  taskArrow: { fontSize: 22, color: Colors.light.textSecondary, paddingLeft: 10 },
})

