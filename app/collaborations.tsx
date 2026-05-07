import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { Project, Team, Task } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

const COLLABORATIONS_STORAGE_KEY = 'team_collaborations_v1';

type TeamCollaboration = {
  teamAId: string;
  teamBId: string;
  createdAt: string;
};

export default function CollaborationsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPrimaryTeamId, setSelectedPrimaryTeamId] = useState<string>('');
  const [selectedSecondaryTeamId, setSelectedSecondaryTeamId] = useState<string>('');
  const [showPrimaryDropdown, setShowPrimaryDropdown] = useState(false);
  const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);
  const [selectedTeamTasks, setSelectedTeamTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const theme = Colors.current;
  const styles = createStyles(theme);

  const mapCollaborationToProject = (teamA: Team, teamB: Team, index: number): Project => {
      const mergedMembersMap = new Map(
        [...teamA.members, ...teamB.members].map((member) => [member.id, member]),
      );
      const mergedMembers = Array.from(mergedMembersMap.values());
      const avgProgress = Math.round((teamA.progress + teamB.progress) / 2);

      return {
        id: `${teamA.id}__${teamB.id}`,
        name: `${teamA.name} x ${teamB.name}`,
        description: `${teamA.name} collaborating with ${teamB.name}`,
        dueDate: new Date().toISOString().slice(0, 10),
        progress: avgProgress,
        status: 'active',
        tasks: 0,
        members: mergedMembers,
        tags: ['collaboration'],
        color: index % 2 === 0 ? teamA.color : teamB.color,
      };
  };

  const readStoredCollaborations = async (): Promise<TeamCollaboration[]> => {
    const raw = await AsyncStorage.getItem(COLLABORATIONS_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as TeamCollaboration[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item?.teamAId && item?.teamBId);
    } catch {
      return [];
    }
  };

  const writeStoredCollaborations = async (collaborations: TeamCollaboration[]) => {
    await AsyncStorage.setItem(COLLABORATIONS_STORAGE_KEY, JSON.stringify(collaborations));
  };

  const loadTeamsAndCollaborations = async () => {
    const loadedTeams: Team[] = await supabaseService.getTeams();
    const storedCollaborations = await readStoredCollaborations();
    const projectsFromStorage = storedCollaborations
      .map((collab, index) => {
        const teamA = loadedTeams.find((team) => team.id === collab.teamAId);
        const teamB = loadedTeams.find((team) => team.id === collab.teamBId);
        if (!teamA || !teamB) return null;
        return mapCollaborationToProject(teamA, teamB, index);
      })
      .filter(Boolean) as Project[];
    setTeams(loadedTeams);
    setProjects(projectsFromStorage);
  };

  useEffect(() => {
    const load = async () => {
      await loadTeamsAndCollaborations();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadSelectedTeamTasks = async () => {
      if (!selectedPrimaryTeamId) {
        setSelectedTeamTasks([]);
        return;
      }
      setTasksLoading(true);
      try {
        const tasks = await supabaseService.getTasksByTeamId(selectedPrimaryTeamId);
        setSelectedTeamTasks(tasks);
      } catch (error: any) {
        Alert.alert('Could not load team tasks', error?.message ?? 'Something went wrong.');
      } finally {
        setTasksLoading(false);
      }
    };
    loadSelectedTeamTasks();
  }, [selectedPrimaryTeamId]);

  const createSelectedTeamsCollaboration = async () => {
    if (!selectedPrimaryTeamId || !selectedSecondaryTeamId) {
      Alert.alert('Select teams', 'Please choose two teams first.');
      return;
    }
    if (selectedPrimaryTeamId === selectedSecondaryTeamId) {
      Alert.alert('Different teams required', 'Please choose two different teams.');
      return;
    }

    try {
      setCreating(true);
      const primaryTeam = teams.find((team) => team.id === selectedPrimaryTeamId);
      const secondaryTeam = teams.find((team) => team.id === selectedSecondaryTeamId);
      if (!primaryTeam || !secondaryTeam) {
        throw new Error('Selected teams were not found.');
      }

      const existing = projects.some((project) => {
        const pairA = `${primaryTeam.id}__${secondaryTeam.id}`;
        const pairB = `${secondaryTeam.id}__${primaryTeam.id}`;
        return project.id === pairA || project.id === pairB;
      });
      if (existing) {
        Alert.alert('Already exists', 'This collaboration already exists.');
        return;
      }

      const storedCollaborations = await readStoredCollaborations();
      const existsInStorage = storedCollaborations.some(
        (item) =>
          (item.teamAId === primaryTeam.id && item.teamBId === secondaryTeam.id) ||
          (item.teamAId === secondaryTeam.id && item.teamBId === primaryTeam.id),
      );
      if (existsInStorage) {
        Alert.alert('Already exists', 'This collaboration already exists.');
        return;
      }

      const collaboration = mapCollaborationToProject(primaryTeam, secondaryTeam, projects.length);
      if (!collaboration) {
        throw new Error('Could not build collaboration from selected teams.');
      }
      await writeStoredCollaborations([
        ...storedCollaborations,
        {
          teamAId: primaryTeam.id,
          teamBId: secondaryTeam.id,
          createdAt: new Date().toISOString(),
        },
      ]);
      setProjects((prev) => [collaboration, ...prev]);
    } catch (error: any) {
      Alert.alert('Could not create collaboration', error?.message ?? 'Something went wrong.');
    } finally {
      setCreating(false);
    }
  };

  const selectedPrimaryTeam = teams.find((team) => team.id === selectedPrimaryTeamId);
  const selectedSecondaryTeam = teams.find((team) => team.id === selectedSecondaryTeamId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Together</Text>
        </View>

        <View style={styles.filtersContainer}>
          <Text style={styles.dropdownLabel}>Team 1</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              setShowPrimaryDropdown((prev) => !prev);
              setShowSecondaryDropdown(false);
            }}
          >
            <Text style={styles.dropdownTriggerText}>
              {selectedPrimaryTeam?.name ?? 'Select first team'}
            </Text>
            {showPrimaryDropdown ? (
              <ChevronUp size={18} color={theme.textSecondary} />
            ) : (
              <ChevronDown size={18} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
          {showPrimaryDropdown && (
            <View style={styles.dropdownList}>
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedPrimaryTeamId(team.id);
                    setShowPrimaryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.dropdownLabel}>Team 2</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              setShowSecondaryDropdown((prev) => !prev);
              setShowPrimaryDropdown(false);
            }}
          >
            <Text style={styles.dropdownTriggerText}>
              {selectedSecondaryTeam?.name ?? 'Select second team'}
            </Text>
            {showSecondaryDropdown ? (
              <ChevronUp size={18} color={theme.textSecondary} />
            ) : (
              <ChevronDown size={18} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
          {showSecondaryDropdown && (
            <View style={styles.dropdownList}>
              {teams
                .filter((team) => team.id !== selectedPrimaryTeamId)
                .map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedSecondaryTeamId(team.id);
                      setShowSecondaryDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{team.name}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>

        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>
            {selectedPrimaryTeam ? `${selectedPrimaryTeam.name} Tasks` : 'Team Tasks'}
          </Text>
          {tasksLoading ? (
            <ActivityIndicator color={theme.tint} />
          ) : selectedPrimaryTeamId && selectedTeamTasks.length === 0 ? (
            <Text style={styles.emptyTasksText}>No tasks for this team yet.</Text>
          ) : (
            selectedTeamTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.status} • {task.progress}%
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.projectsList}>
          {loading && <ActivityIndicator color={theme.tint} />}
          {projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={[styles.projectCard, { backgroundColor: project.color }]}
            >
              <View style={styles.projectIcon}>
                <Text style={styles.projectIconText}>
                  {project.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.membersLabel}>Members</Text>
              <View style={styles.membersRow}>
                {project.members.map((member, idx) => (
                  <Image
                    key={member.id || idx}
                    source={{ uri: member.avatar }}
                    style={[
                      styles.memberAvatar,
                      { marginLeft: idx > 0 ? -8 : 0 },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.progressText}>{project.progress}% completed</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, creating && styles.fabDisabled]}
        onPress={createSelectedTeamsCollaboration}
        disabled={creating}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  headerIcon: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
  },
  projectsList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 100,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 6,
  },
  dropdownTrigger: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    fontSize: 15,
    color: theme.text,
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownItemText: {
    fontSize: 14,
    color: theme.text,
  },
  tasksContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
  },
  emptyTasksText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  taskItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 12,
    color: theme.textSecondary,
    textTransform: 'capitalize',
  },
  projectCard: {
    borderRadius: 20,
    padding: 20,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectIconText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  membersLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  membersRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabDisabled: {
    opacity: 0.7,
  },
});
