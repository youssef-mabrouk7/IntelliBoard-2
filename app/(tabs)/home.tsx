import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Search, Bell, ArrowRight, Circle, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import SideDrawer from '@/components/SideDrawer';
import { supabaseService } from '@/services/supabaseService';
import { Project, Task } from '@/constants/types';
import { useEffect } from 'react';
import { toISODate, useLocalization, weekDates } from '@/utils/localization';
import { useMemo } from 'react';

export default function HomeScreen() {
  const { t, locale, isRTL, formatDate } = useLocalization();
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const theme = Colors.current;
  const styles = createStyles(theme);

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
      const nextProgress = nextStatus === 'completed' ? 100 : 0;
      await supabaseService.updateTaskStatus(task.id, nextStatus as any, nextProgress);
      await refreshTasks();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const week = useMemo(() => weekDates(new Date()), []);
  const tasksForDate = useMemo(
    () => tasks.filter((task) => toISODate(new Date(task.dueDate)) === selectedDate),
    [selectedDate, tasks],
  );
  const searchedProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects.slice(0, 2);
    return projects.filter((project) => {
      return (
        project.name.toLowerCase().includes(q) ||
        (project.description || '').toLowerCase().includes(q) ||
        (project.companyName || '').toLowerCase().includes(q)
      );
    }).slice(0, 2);
  }, [projects, searchQuery]);
  const searchedTasksForDate = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasksForDate;
    return tasksForDate.filter((task) => {
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description || '').toLowerCase().includes(q) ||
        (task.category || '').toLowerCase().includes(q)
      );
    });
  }, [tasksForDate, searchQuery]);
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(selectedDate)),
    [locale, selectedDate],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/all-tasks')}>
            <Search size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/notifications-settings')}>
            <Bell size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search projects and tasks..."
              placeholderTextColor={theme.textSecondary}
              style={styles.searchInput}
            />
          </View>
        </View>
        <View style={styles.dateSection}>
          <Text style={styles.monthText}>{monthLabel}</Text>
          <View style={styles.daysRow}>
            {week.map((day) => {
              const iso = toISODate(day);
              const isSelected = iso === selectedDate;
              return (
              <TouchableOpacity
                key={iso}
                style={[
                  styles.dayItem,
                  isSelected && styles.dayItemSelected,
                ]}
                onPress={() => setSelectedDate(iso)}
              >
                <Text style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                ]}>
                  {new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day)}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                ]}>
                  {day.getDate()}
                </Text>
              </TouchableOpacity>
            )})}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('collaboration')}</Text>
            <TouchableOpacity onPress={() => router.push('/collaborations')}>
              <Text style={styles.seeAllText}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectsScroll}>
            {searchedProjects.map((project) => (
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
            <Text style={styles.sectionTitle}>{t('allTasks')}</Text>
            <TouchableOpacity onPress={() => router.push('/all-tasks')}>
              <Text style={styles.seeAllText}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tasksList}>
            {searchedTasksForDate.map((task) => (
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
                    <ActivityIndicator size="small" color={theme.tint} />
                  ) : task.status === 'completed' ? (
                    <View style={[styles.checkCircle, { backgroundColor: theme.status.completed }]}>
                      <Check size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <Circle size={20} color={theme.border} />
                  )}
                </TouchableOpacity>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubtitle}>{t('due')}: {formatDate(task.dueDate)}</Text>
                </View>
                <View style={styles.taskActions}>
                  <TouchableOpacity style={styles.arrowButton}>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            {searchedTasksForDate.length === 0 && (
              <Text style={[styles.taskSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('noTasksForDate')}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <SideDrawer isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </SafeAreaView>
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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.cardSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
    padding: 0,
  },
  dateSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
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
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 50,
  },
  dayItemSelected: {
    backgroundColor: theme.tintDark,
    borderColor: theme.tintDark,
  },
  dayLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
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
    color: theme.text,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.tint,
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
    backgroundColor: theme.card,
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
    color: theme.text,
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.tintDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
