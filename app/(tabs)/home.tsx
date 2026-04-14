import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Search, Bell, ArrowRight, MessageCircle, Circle, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import SideDrawer from '@/components/SideDrawer';
import { supabaseService } from '@/services/supabaseService';
import { Project, Task } from '@/constants/types';
import { useEffect } from 'react';

const homeDays = [
  { day: 'Fri', date: 11 },
  { day: 'Sat', date: 12 },
  { day: 'Sun', date: 14, isSelected: true },
  { day: 'Mon', date: 14 },
  { day: 'Tue', date: 15 },
];

export default function HomeScreen() {
  const [selectedDay, setSelectedDay] = useState(2);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, tasksData] = await Promise.all([
          supabaseService.getProjects(),
          supabaseService.getTasks()
        ]);
        setProjects(projectsData);
        setTasks(tasksData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
      }
    }
    loadData();
  }, []);

  const refreshTasks = async () => {
    const tasksData = await supabaseService.getTasks();
    setTasks(tasksData || []);
  };

  const toggleComplete = async (task: Task) => {
    if (updatingTaskId) return;
    try {
      setUpdatingTaskId(task.id);
      const nextStatus = task.status === 'completed' ? 'inProgress' : 'completed';
      const nextProgress = nextStatus === 'completed' ? 100 : Math.min(task.progress || 0, 99);
      await supabaseService.updateTaskStatus(task.id, nextStatus as any, nextProgress);
      await refreshTasks();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Menu size={24} color={Colors.light.text} />
        </TouchableOpacity>
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
        <View style={styles.dateSection}>
          <Text style={styles.monthText}>Aug 2026</Text>
          <View style={styles.daysRow}>
            {homeDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayItem,
                  index === selectedDay && styles.dayItemSelected,
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={[
                  styles.dayLabel,
                  index === selectedDay && styles.dayLabelSelected,
                ]}>
                  {day.day}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  index === selectedDay && styles.dayNumberSelected,
                ]}>
                  {day.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Collaboration</Text>
            <TouchableOpacity onPress={() => router.push('/collaborations')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectsScroll}>
            {projects.slice(0, 2).map((project) => (
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
                  {project.members.slice(0, 5).map((member, idx) => (
                    <Image
                      key={idx}
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
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All tasks</Text>
            <TouchableOpacity onPress={() => router.push('/all-tasks')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tasksList}>
            {tasks.slice(0, 3).map((task) => (
              <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => router.push(`/task/${task.id}`)}>
                <View style={[styles.taskIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={(e: any) => {
                    e?.stopPropagation?.();
                    toggleComplete(task);
                  }}
                  disabled={updatingTaskId === task.id}
                >
                  {updatingTaskId === task.id ? (
                    <ActivityIndicator size="small" color={Colors.light.tint} />
                  ) : task.status === 'completed' ? (
                    <View style={[styles.checkCircle, { backgroundColor: Colors.light.status.completed }]}>
                      <Check size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <Circle size={20} color={Colors.light.border} />
                  )}
                </TouchableOpacity>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubtitle}>Projects</Text>
                </View>
                <View style={styles.taskActions}>
                  <View style={styles.commentBadge}>
                    <MessageCircle size={14} color={Colors.light.tint} />
                    <Text style={styles.commentCount}>{task.subtasks}</Text>
                  </View>
                  <TouchableOpacity style={styles.arrowButton}>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <SideDrawer isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </SafeAreaView>
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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  dateSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minWidth: 50,
  },
  dayItemSelected: {
    backgroundColor: Colors.light.tintDark,
    borderColor: Colors.light.tintDark,
  },
  dayLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  projectsScroll: {
    paddingLeft: 16,
  },
  projectCard: {
    width: 180,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectIconText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  membersLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  membersRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
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
  tasksList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkButton: {
    marginRight: 10,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tintDark,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  commentCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tintDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
