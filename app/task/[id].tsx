import { useLocalSearchParams, router } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, Calendar, Briefcase, Users } from 'lucide-react-native'

import Colors from '@/constants/colors'
import type { Project, Task, Team } from '@/constants/types'
import { supabaseService } from '@/services/supabaseService'

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const taskId = Array.isArray(id) ? id[0] : id

  const [task, setTask] = useState<Task | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!taskId) return
      try {
        setLoading(true)
        setError(null)
        const [t, ps, ts] = await Promise.all([
          supabaseService.getTaskById(taskId),
          supabaseService.getProjects(),
          supabaseService.getTeams(),
        ])
        setTask(t)
        setProjects(ps)
        setTeams(ts)
      } catch (e: any) {
        setError(e?.message || 'Failed to load task')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [taskId])

  const project = useMemo(
    () => (task?.projectId ? projects.find((p) => p.id === task.projectId) : undefined),
    [projects, task?.projectId],
  )
  const team = useMemo(
    () => (task?.teamId ? teams.find((t) => t.id === task.teamId) : undefined),
    [teams, task?.teamId],
  )

  if (!taskId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: Colors.light.error }}>Missing task id.</Text>
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
        <Text style={styles.headerTitle}>Task</Text>
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

      {!loading && !error && task && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>{task.title}</Text>
            {!!task.description && <Text style={styles.description}>{task.description}</Text>}
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Calendar size={18} color={Colors.light.tint} />
              <Text style={styles.rowLabel}>Due</Text>
              <Text style={styles.rowValue}>{task.dueDate}</Text>
            </View>
            <View style={styles.row}>
              <Briefcase size={18} color="#7B8CDE" />
              <Text style={styles.rowLabel}>Project</Text>
              <Text style={styles.rowValue}>{project?.name || 'None'}</Text>
            </View>
            <View style={styles.row}>
              <Users size={18} color="#FFB74D" />
              <Text style={styles.rowLabel}>Team</Text>
              <Text style={styles.rowValue}>{team?.name || 'None'}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Assignees</Text>
            {task.assignees.length === 0 ? (
              <Text style={styles.muted}>Unassigned</Text>
            ) : (
              <View style={styles.assignees}>
                {task.assignees.map((u) => (
                  <View key={u.id} style={styles.assigneeChip}>
                    <Image
                      source={{ uri: u.avatar || 'https://via.placeholder.com/60' }}
                      style={styles.assigneeAvatar}
                    />
                    <Text style={styles.assigneeText}>{u.name || u.email}</Text>
                  </View>
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
  card: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  rowLabel: {
    width: 70,
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  muted: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  assignees: {
    gap: 10,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  assigneeAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.border,
  },
  assigneeText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
  },
})

