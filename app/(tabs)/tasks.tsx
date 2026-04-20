import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Menu, Search, Bell, Plus, Clock, CheckCircle, AlertCircle, Circle, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import SideDrawer from '@/components/SideDrawer';
import { supabaseService } from '@/services/supabaseService';
import type { Project, Task } from '@/constants/types';
import { useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalization } from '@/utils/localization';

type FilterType = 'All' | 'In Progress' | 'Completed' | 'Overdue';

export default function TasksScreen() {
  const { t, isRTL, formatDate } = useLocalization();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = Colors.current;
  const styles = createStyles(theme);

  const fetchTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getTasks();
      const projectsData = await supabaseService.getProjects();
      setTasks(data);
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [fetchTasks]),
  );

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'In Progress') return task.status === 'inProgress';
    if (activeFilter === 'Completed') return task.status === 'completed';
    if (activeFilter === 'Overdue') return task.status === 'overdue';
    return true;
  });

  const inProgressCount = tasks.filter(t => t.status === 'inProgress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('tasks')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Search size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Bell size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.dropdown} onPress={() => router.push('/all-tasks')}>
          <View style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>{t('filterAllTasks')}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.activeTasksText}>{`${filteredTasks.length} ${t('activeTasks')}`}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>{t('inProgress')}</Text>
            <Text style={styles.statCount}>{`${inProgressCount} ${t('taskPlural')}`}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <CheckCircle size={20} color="#4A7C9B" />
            </View>
            <Text style={styles.statLabel}>{t('completed')}</Text>
            <Text style={styles.statCount}>{`${completedCount} ${t('taskPlural')}`}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <AlertCircle size={20} color="#F44336" />
            </View>
            <Text style={styles.statLabel}>{t('overdue')}</Text>
            <Text style={styles.statCount}>{`${overdueCount} ${overdueCount === 1 ? t('taskSingular') : t('taskPlural')}`}</Text>
          </View>
        </View>

        <View style={[styles.filterRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {(['All', 'In Progress', 'Completed', 'Overdue'] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter === 'All' ? t('all') : filter === 'In Progress' ? t('inProgress') : filter === 'Completed' ? t('completed') : t('overdue')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tasksList}>
          {!loading && filteredTasks.length === 0 && <Text style={styles.filterText}>{t('noTasksFound')}</Text>}
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={projects.find((project) => project.id === task.projectId)}
              onChanged={fetchTasks}
              formatDate={formatDate}
              t={t}
            />
          ))}
        </View>
      </ScrollView>

      <SideDrawer isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/create-task')}>
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function TaskCard({
  task,
  project,
  onChanged,
  formatDate,
  t,
}: {
  task: Task;
  project?: Project;
  onChanged: () => void;
  formatDate: (value: string | Date) => string;
  t: (key: any) => string;
}) {
  const [updating, setUpdating] = React.useState(false);
  const theme = Colors.current;
  const styles = createStyles(theme);

  const toggleComplete = async (e: any) => {
    e?.stopPropagation?.();
    if (updating) return;
    try {
      setUpdating(true);
      const nextStatus = task.status === 'completed' ? 'inProgress' : 'completed';
      const nextProgress = nextStatus === 'completed' ? 100 : 0;
      await supabaseService.updateTaskStatus(task.id, nextStatus as any, nextProgress);
      onChanged();
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = () => {
    if (task.status === 'completed') return theme.status.completed;
    if (task.status === 'overdue') return theme.status.overdue;
    return getPriorityColor(task.priority);
  };

  const getCardStyle = () => {
    if (task.status === 'completed') return styles.taskCardCompleted;
    if (task.status === 'overdue') return styles.taskCardOverdue;
    return styles.taskCard;
  };

  return (
    <TouchableOpacity style={getCardStyle()} onPress={() => router.push(`/task/${task.id}`)}>
      <View style={styles.taskHeader}>
        <View style={styles.taskLeft}>
          <TouchableOpacity style={styles.checkButton} onPress={toggleComplete} disabled={updating}>
            {updating ? (
              <ActivityIndicator size="small" color={theme.tint} />
            ) : task.status === 'completed' ? (
              <View style={[styles.checkCircle, { backgroundColor: theme.status.completed }]}>
                <Check size={16} color="#FFFFFF" />
              </View>
            ) : (
              <Circle size={22} color={theme.border} />
            )}
          </TouchableOpacity>
          <View style={[styles.statusPill, { borderColor: getStatusColor() }]}>
            <Text style={[styles.statusPillText, { color: getStatusColor() }]}>
              {task.status === 'completed' ? t('done') : t('notDone')}
            </Text>
          </View>
          <View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDueDate}>{`${t('dueLabel')}: ${formatDate(task.dueDate)}`}</Text>
            {!!project?.name && (
              <View style={styles.projectTag}>
                <Text style={styles.projectTagText}>{project.name}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </View>
      <View style={styles.taskFooter}>
        <TouchableOpacity
          style={[styles.doneButton, task.status === 'completed' && styles.doneButtonCompleted]}
          onPress={toggleComplete}
          disabled={updating}
        >
          {updating ? <ActivityIndicator size="small" color={theme.tintDark} /> : <Text style={styles.doneButtonText}>Task Done</Text>}
        </TouchableOpacity>
        <View style={styles.assigneesRow}>
          {task.assignees.length === 0 ? (
            <Text style={styles.unassignedText}>Unassigned</Text>
          ) : (
            task.assignees.slice(0, 3).map((assignee, idx) => {
              const label = (assignee?.name || assignee?.email || 'User').trim();
              const initial = label.charAt(0).toUpperCase();
              return assignee?.avatar ? (
                <Image
                  key={assignee.id || idx}
                  source={{ uri: assignee.avatar }}
                  accessibilityLabel={`Assigned member ${label}`}
                  style={[styles.assigneeAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                />
              ) : (
                <View
                  key={assignee.id || idx}
                  accessibilityLabel={`Assigned member ${label}`}
                  style={[styles.assigneeFallback, { marginLeft: idx > 0 ? -8 : 0 }]}
                >
                  <Text style={styles.assigneeFallbackText}>{initial || 'U'}</Text>
                </View>
              );
            })
          )}
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${task.status === 'completed' ? 100 : 0}%`, backgroundColor: getStatusColor() },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{task.status === 'completed' ? t('done') : t('notDone')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getPriorityColor(priority: string) {
  const theme = Colors.current;
  switch (priority) {
    case 'high':
      return theme.priority.high;
    case 'medium':
      return theme.priority.medium;
    case 'low':
      return theme.priority.low;
    default:
      return theme.tint;
  }
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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  dropdown: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dropdownButton: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 14,
    color: theme.text,
  },
  activeTasksText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.tint,
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.tintDark,
  },
  filterText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  filterTextActive: {
    color: theme.tintDark,
    fontWeight: '600',
  },
  tasksList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
  },
  taskCardCompleted: {
    backgroundColor: `${theme.status.completed}22`,
    borderRadius: 16,
    padding: 16,
  },
  taskCardOverdue: {
    backgroundColor: `${theme.status.overdue}22`,
    borderRadius: 16,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkButton: {
    marginRight: 10,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPill: {
    borderWidth: 2,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: theme.card,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  taskDueDate: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneesRow: {
    flexDirection: 'row',
    marginRight: 12,
  },
  assigneeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.card,
  },
  assigneeFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.card,
    backgroundColor: theme.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeFallbackText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  unassignedText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    color: theme.textSecondary,
    minWidth: 60,
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
  projectTag: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: `${theme.tint}1A`,
    borderWidth: 1,
    borderColor: `${theme.tint}4D`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  projectTagText: {
    color: theme.tint,
    fontSize: 11,
    fontWeight: '700',
  },
  doneButton: {
    height: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 10,
    minWidth: 92,
  },
  doneButtonCompleted: {
    borderColor: theme.status.completed,
    backgroundColor: `${theme.status.completed}22`,
  },
  doneButtonText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
