import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, ClipboardList } from 'lucide-react-native';

import Colors from '@/constants/colors';
import type { Task, Team } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

export default function TeamDetailsScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);

  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Array.isArray(id) ? id[0] : id;

  const [team, setTeam] = useState<Team | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!teamId) return;
      try {
        setLoading(true);
        setError(null);
        const [t, ts] = await Promise.all([
          supabaseService.getTeamById(teamId),
          supabaseService.getTasksByTeamId(teamId),
        ]);
        setTeam(t);
        setTasks(ts);
      } catch (e: any) {
        setError(e?.message || 'Failed to load team');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teamId]);

  const doneCount = useMemo(() => tasks.filter((t) => t.status === 'completed').length, [tasks]);

  if (!teamId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.error }}>Missing team id.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && (
        <View style={{ padding: 16 }}>
          <ActivityIndicator color={theme.tint} />
        </View>
      )}
      {!!error && (
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.error }}>{error}</Text>
        </View>
      )}

      {!loading && !error && team && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.teamTitleRow}>
              <View style={[styles.teamIcon, { backgroundColor: team.color }]}>
                <Text style={styles.teamIconText}>{team.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{team.name}</Text>
                {!!team.description && <Text style={styles.description}>{team.description}</Text>}
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Users size={16} color={theme.textSecondary} />
                <Text style={styles.metaText}>{team.memberCount} members</Text>
              </View>
              <View style={styles.metaItem}>
                <ClipboardList size={16} color={theme.textSecondary} />
                <Text style={styles.metaText}>{doneCount}/{tasks.length} tasks done</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Members</Text>
            {team.members.length === 0 ? (
              <Text style={styles.muted}>No members</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {team.members.map((m) => (
                  <View key={m.id} style={styles.memberRow}>
                    <Image source={{ uri: m.avatar || 'https://via.placeholder.com/60' }} style={styles.memberAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{m.name || m.email}</Text>
                      <Text style={styles.memberEmail}>{m.email}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            {tasks.length === 0 ? (
              <Text style={styles.muted}>No tasks</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {tasks.map((t) => (
                  <TouchableOpacity key={t.id} style={styles.taskRow} onPress={() => router.push(`/task/${t.id}`)}>
                    <View style={[styles.taskStatusDot, { backgroundColor: t.status === 'completed' ? theme.status.completed : theme.border }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle}>{t.title}</Text>
                      <Text style={styles.taskSub}>{t.status === 'completed' ? 'Done' : 'Not Done'} · Due {t.dueDate}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: theme.tintDark },
  card: { backgroundColor: theme.cardSecondary, borderRadius: 16, marginHorizontal: 16, marginTop: 12, padding: 16 },
  teamTitleRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  teamIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  teamIconText: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
  title: { fontSize: 18, fontWeight: '800', color: theme.text },
  description: { marginTop: 4, fontSize: 13, color: theme.textSecondary, lineHeight: 18 },
  metaRow: { marginTop: 14, flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  metaText: { color: theme.text, fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 },
  muted: { color: theme.textSecondary, fontSize: 14, fontWeight: '600' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 10 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.border },
  memberName: { color: theme.text, fontWeight: '800', fontSize: 13 },
  memberEmail: { color: theme.textSecondary, fontWeight: '600', fontSize: 12, marginTop: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 10 },
  taskStatusDot: { width: 10, height: 10, borderRadius: 5 },
  taskTitle: { color: theme.text, fontWeight: '800', fontSize: 13 },
  taskSub: { color: theme.textSecondary, fontWeight: '600', fontSize: 12, marginTop: 2 },
});
