import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Menu, Search, Bell, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { tasks } from '@/constants/mockData';
import type { Task } from '@/constants/types';
import SideDrawer from '@/components/SideDrawer';

type FilterType = 'All' | 'In Progress' | 'Completed' | 'Overdue';

export default function TasksScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [drawerVisible, setDrawerVisible] = useState(false);

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
          <Menu size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Search size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Bell size={22} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.dropdown} onPress={() => router.push('/all-tasks')}>
          <View style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>All Tasks</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.activeTasksText}>8 Active Tasks</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={styles.statCount}>{inProgressCount} Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <CheckCircle size={20} color="#4A7C9B" />
            </View>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statCount}>{completedCount} Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <AlertCircle size={20} color="#F44336" />
            </View>
            <Text style={styles.statLabel}>Overdue</Text>
            <Text style={styles.statCount}>{overdueCount} Task</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['All', 'In Progress', 'Completed', 'Overdue'] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tasksList}>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
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

function TaskCard({ task }: { task: Task }) {
  const getStatusColor = () => {
    if (task.status === 'completed') return Colors.light.status.completed;
    if (task.status === 'overdue') return Colors.light.status.overdue;
    return getPriorityColor(task.priority);
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
          <View style={[styles.progressCircle, { borderColor: getStatusColor() }]}>
            <Text style={[styles.progressTextCircle, { color: getStatusColor() }]}>
              {task.progress}%
            </Text>
          </View>
          <View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDueDate}>Due: {formatDate(task.dueDate)}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
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
            <View style={[styles.progressFill, { width: `${task.progress}%`, backgroundColor: getStatusColor() }]} />
          </View>
          <Text style={styles.progressPercent}>{task.progress}%</Text>
        </View>
      </View>
    </View>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return Colors.light.priority.high;
    case 'medium':
      return Colors.light.priority.medium;
    case 'low':
      return Colors.light.priority.low;
    default:
      return Colors.light.tint;
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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
    backgroundColor: '#C5D5E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  activeTasksText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
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
    backgroundColor: Colors.light.tint,
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
    borderBottomColor: Colors.light.border,
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tintDark,
  },
  filterText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  filterTextActive: {
    color: Colors.light.tintDark,
    fontWeight: '600',
  },
  tasksList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#C5D5E0',
    borderRadius: 16,
    padding: 16,
  },
  taskCardCompleted: {
    backgroundColor: '#C8F6D8',
    borderRadius: 16,
    padding: 16,
  },
  taskCardOverdue: {
    backgroundColor: '#FFE5E5',
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
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  progressTextCircle: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  taskDueDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
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
    color: Colors.light.textSecondary,
    minWidth: 32,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
