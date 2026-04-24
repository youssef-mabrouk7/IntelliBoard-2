import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { Task } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';
import { useLocalization } from '@/utils/localization';

type FilterType = 'All' | 'In Progress' | 'Completed' | 'Overdue';

export default function AllTasksScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t, isRTL, formatDate } = useLocalization();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await supabaseService.getTasks();
        setTasks(data);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err?.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

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
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('allTasksTitle')}</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Search size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
          {loading && <ActivityIndicator color={theme.tint} />}
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!loading && !error && filteredTasks.length === 0 && (
            <Text style={styles.errorText}>{t('noTasksFound')}</Text>
          )}
          {!loading && !error && filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} formatDate={formatDate} t={t} theme={theme} styles={styles} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TaskCard({
  task,
  formatDate,
  t,
  theme,
  styles,
}: {
  task: Task;
  formatDate: (value: string | Date) => string;
  t: (key: any) => string;
  theme: typeof Colors.light;
  styles: any;
}) {
  const getStatusColor = () => {
    if (task.status === 'completed') return theme.status.completed;
    if (task.status === 'overdue') return theme.status.overdue;
    return getPriorityColor(task.priority, theme);
  };

  const getCardStyle = () => {
    if (task.status === 'completed') return styles.taskCardCompleted;
    if (task.status === 'overdue') return styles.taskCardOverdue;
    return styles.taskCard;
  };

  return (
    <View style={getCardStyle()}>
      <View style={styles.taskHeader}>
        <View style={styles.taskLeft}>
          <View style={[styles.statusPill, { borderColor: getStatusColor() }]}>
            <Text style={[styles.statusPillText, { color: getStatusColor() }]}>
              {task.status === 'completed' ? t('done') : t('notDone')}
            </Text>
          </View>
          <View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDueDate}>{`${t('dueLabel')}: ${formatDate(task.dueDate)}`}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority, theme) }]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </View>
      <View style={styles.taskFooter}>
        <View style={styles.assigneesRow}>
          {task.assignees.slice(0, 3).map((assignee, idx) => (
            <Image
              key={idx}
              source={{ uri: assignee.avatar }}
              style={[styles.assigneeAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
            />
          ))}
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
    </View>
  );
}

function getPriorityColor(priority: string, theme: typeof Colors.light) {
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
  headerIcon: {
    padding: 4,
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
    paddingBottom: 30,
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
  statusPill: {
    borderWidth: 2,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
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
    borderColor: '#FFFFFF',
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
    backgroundColor: 'rgba(0,0,0,0.1)',
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
  errorText: {
    color: theme.error,
    fontSize: 14,
  },
});
