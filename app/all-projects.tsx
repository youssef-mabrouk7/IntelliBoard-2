import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Grid3X3, List } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Project } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

export default function AllProjectsScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await supabaseService.getProjects();
        setProjects(data);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err?.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return project.status === 'active';
    if (activeFilter === 'Completed') return project.status === 'completed';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Projects</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={20} color={viewMode === 'list' ? theme.tint : theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Grid3X3 size={20} color={viewMode === 'grid' ? theme.tint : theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{projects.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{projects.filter(p => p.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{projects.filter(p => p.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['All', 'Active', 'Completed'] as const).map((filter) => (
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

        <View style={viewMode === 'grid' ? styles.projectsGrid : styles.projectsList}>
          {loading && <ActivityIndicator color={theme.tint} />}
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!loading && !error && filteredProjects.map((project) => (
            <TouchableOpacity 
              key={project.id} 
              style={[styles.projectCard, viewMode === 'grid' && styles.projectCardGrid]}
              onPress={() => router.push(`/project/${project.id}`)}
            >
              <View style={[styles.projectIcon, { backgroundColor: project.color }]}>
                <Text style={styles.projectIconText}>{project.name.charAt(0)}</Text>
              </View>
              <View style={styles.projectContent}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: project.color + '33' }]}>
                    <Text style={[styles.statusText, { color: project.color }]}>
                      {project.status === 'onHold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${project.progress}%`, backgroundColor: project.color }]} />
                  </View>
                  <Text style={styles.progressText}>{project.progress}%</Text>
                </View>
                <View style={styles.projectFooter}>
                  <Text style={styles.dueDate}>Due: {project.dueDate || '-'}</Text>
                  <View style={styles.membersRow}>
                    {project.members.slice(0, 2).map((member, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: member.avatar || 'https://via.placeholder.com/60' }}
                        style={[styles.memberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-project')}>
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: theme.tint + '20',
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
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
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
    paddingHorizontal: 16,
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
  projectsList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 100,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 100,
  },
  projectCard: {
    flexDirection: 'row',
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
  },
  projectCardGrid: {
    width: '47%',
    flexDirection: 'column',
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  projectContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 8,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  membersRow: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.cardSecondary,
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
  errorText: {
    color: theme.error,
    fontSize: 14,
  },
});
