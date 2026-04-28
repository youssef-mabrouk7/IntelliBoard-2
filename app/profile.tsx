import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Folder, CheckCircle, Users, ChevronRight, Settings } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabaseService } from '@/services/supabaseService';
import { Project, Task, Team, User } from '@/constants/types';
import { useLocalization } from '@/utils/localization';

export default function ProfileScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();
  const [profile, setProfile] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const myTasks = tasks.slice(0, 3);

  useEffect(() => {
    const loadData = async () => {
      const [profileData, tasksData, teamsData, projectsData] = await Promise.all([
        supabaseService.getCurrentProfile(),
        supabaseService.getTasks(),
        supabaseService.getTeams(),
        supabaseService.getProjects(),
      ]);
      setProfile(profileData);
      setTasks(tasksData);
      setTeams(teamsData);
      setProjects(projectsData);
    };
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Settings size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: profile?.avatar || 'https://via.placeholder.com/120' }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile?.name || profile?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.email}>{profile?.email || 'No email'}</Text>
            </View>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile?.role || 'Member'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/projects')}>
            <View style={[styles.statIcon, { backgroundColor: theme.tint + '20' }]}>
              <Folder size={20} color={theme.tint} />
            </View>
            <Text style={styles.statNumber}>{Math.max(0, projects.length)}</Text>
            <Text style={styles.statLabel}>{t('projects')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/all-tasks')}>
            <View style={[styles.statIcon, { backgroundColor: theme.status.completed + '20' }]}>
              <CheckCircle size={20} color={theme.status.completed} />
            </View>
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>{t('tasks')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/all-teams')}>
            <View style={[styles.statIcon, { backgroundColor: theme.priority.high + '20' }]}>
              <Users size={20} color={theme.priority.high} />
            </View>
            <Text style={styles.statNumber}>{teams.length}</Text>
            <Text style={styles.statLabel}>{t('teams')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/all-tasks')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tasksList}>
            {myTasks.map((task, index) => (
              <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => router.push('/all-tasks')}>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
                  </View>
                </View>
                <View style={[styles.timeBadge, getTimeBadgeStyle(index, theme)]}>
                  <Text style={[styles.timeText, getTimeTextStyle(index, theme)]}>
                    {getTimeLabel(index)}
                  </Text>
                  <ChevronRight size={16} color={getTimeColor(index, theme)} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('teamsSection')}</Text>
            <TouchableOpacity onPress={() => router.push('/all-teams')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.teamsList}>
            {teams.slice(0, 1).map((team) => (
              <TouchableOpacity key={team.id} style={styles.teamItem} onPress={() => router.push(`/team/${team.id}`)}>
                <View>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamEmail}>{profile?.email || 'No email'}</Text>
                </View>
                <View style={styles.membersRow}>
                  {team.members.slice(0, 3).map((member, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: member.avatar }}
                      style={[styles.memberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                    />
                  ))}
                  <View style={styles.moreBadge}>
                    <Text style={styles.moreText}>+5</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editButtonText}>{t('editProfile')}</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeBadgeStyle(index: number, theme: typeof Colors.light) {
  if (index === 0) return { backgroundColor: theme.priority.high + '20' };
  if (index === 1) return { backgroundColor: theme.warning + '20' };
  return { backgroundColor: theme.status.completed + '20' };
}

function getTimeTextStyle(index: number, theme: typeof Colors.light) {
  if (index === 0) return { color: theme.priority.high };
  if (index === 1) return { color: theme.warning };
  return { color: theme.status.completed };
}

function getTimeColor(index: number, theme: typeof Colors.light) {
  if (index === 0) return theme.priority.high;
  if (index === 1) return theme.warning;
  return theme.status.completed;
}

function getTimeLabel(index: number) {
  if (index === 0) return '2 days left';
  if (index === 1) return '1 day left';
  return '60%';
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
  profileCard: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.tint,
    fontWeight: '500',
  },
  tasksList: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: theme.tint,
    borderRadius: 3,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  teamsList: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
  },
  teamItem: {
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.tint,
    marginHorizontal: 16,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
