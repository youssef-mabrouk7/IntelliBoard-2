import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Search, Bell, Plus, ChevronDown, ArrowUpDown } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import SideDrawer from '@/components/SideDrawer';
import { supabaseService } from '@/services/supabaseService';
import { Project } from '@/constants/types';
import { useFocusEffect } from '@react-navigation/native';

export default function ProjectsScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Completed'>('All');
  const [sortBy, setSortBy] = useState<'Date' | 'Name' | 'Progress'>('Date');
  const [filterBy, setFilterBy] = useState<'All' | 'Design' | 'Development' | 'Marketing'>('All');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = React.useCallback(async () => {
    try {
      const data = await supabaseService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useFocusEffect(React.useCallback(() => { fetchProjects(); }, [fetchProjects]));

  let filteredProjects = projects.filter((p) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return p.status === 'active';
    if (activeTab === 'Completed') return p.status === 'completed';
    return true;
  });
  if (filterBy !== 'All') filteredProjects = filteredProjects.filter(p => p.tags.includes(filterBy));
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    filteredProjects = filteredProjects.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.companyName || '').toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }
  filteredProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'Date') return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    if (sortBy === 'Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Progress') return b.progress - a.progress;
    return 0;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Projects</Text>
        <View style={styles.headerRight}>
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
              placeholder="Search projects..."
              placeholderTextColor={theme.textSecondary}
              style={styles.searchInput}
            />
          </View>
        </View>
        <View style={styles.tabRow}>
          {(['All', 'Active', 'Completed'] as const).map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.newProjectButton} onPress={() => router.push('/new-project' as const)}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.newProjectText}>New Project</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterButton} onPress={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); }}>
            <ArrowUpDown size={16} color={theme.textSecondary} />
            <Text style={styles.filterText}>Sort by: {sortBy}</Text>
            <ChevronDown size={16} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); }}>
            <Text style={styles.filterText}>Filter: {filterBy}</Text>
            <ChevronDown size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {showSortDropdown && (
          <View style={styles.dropdownMenu}>
            {(['Date', 'Name', 'Progress'] as const).map((option) => (
              <TouchableOpacity key={option} style={[styles.dropdownItem, sortBy === option && styles.dropdownItemActive]} onPress={() => { setSortBy(option); setShowSortDropdown(false); }}>
                <Text style={[styles.dropdownItemText, sortBy === option && styles.dropdownItemTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showFilterDropdown && (
          <View style={styles.dropdownMenu}>
            {(['All', 'Design', 'Development', 'Marketing'] as const).map((option) => (
              <TouchableOpacity key={option} style={[styles.dropdownItem, filterBy === option && styles.dropdownItemActive]} onPress={() => { setFilterBy(option); setShowFilterDropdown(false); }}>
                <Text style={[styles.dropdownItemText, filterBy === option && styles.dropdownItemTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.allProjectsButton} onPress={() => router.push('/all-projects' as const)}>
          <Text style={styles.allProjectsText}>View All Projects</Text>
          <ChevronDown size={16} color={theme.tint} style={{ transform: [{ rotate: '-90deg' }] }} />
        </TouchableOpacity>

        <View style={styles.projectsList}>
          {filteredProjects.map((project) => (
            <TouchableOpacity key={project.id} style={styles.projectCard} onPress={() => router.push(`/project/${project.id}`)}>
              <Text style={styles.projectName}>{project.name}</Text>
              <View style={styles.tagsRow}>
                {!!project.companyName && (
                  <View style={styles.companyBadge}><Text style={styles.companyText}>{project.companyName}</Text></View>
                )}
                {project.tags.map((tag, idx) => (
                  <View key={idx} style={[styles.tagBadge, { backgroundColor: getTagColor(tag, theme) }]}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${project.progress}%`, backgroundColor: getProgressColor(project.progress, theme) }]} />
                </View>
                <Text style={styles.progressPercent}>{project.progress}%</Text>
              </View>
              <View style={styles.projectFooter}>
                <View style={styles.footerLeft}>
                  <Text style={styles.dueDate}>Due: {project.dueDate}</Text>
                  <Text style={styles.taskCount}>{project.tasks} Tasks</Text>
                </View>
                <View style={styles.membersRow}>
                  {project.members.slice(0, 3).map((member, idx) => (
                    <Image key={idx} source={{ uri: member.avatar || 'https://via.placeholder.com/60' }} style={[styles.memberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]} />
                  ))}
                  <View style={styles.arrowButton}><Text style={styles.arrowText}>›</Text></View>
                </View>
              </View>
              {project.description && <Text style={styles.description}>{project.description}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <SideDrawer isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </SafeAreaView>
  );
}

function getTagColor(tag: string, theme: typeof Colors.light) {
  switch (tag) {
    case 'Design': return theme.tint;
    case 'Development': return theme.tint;
    case 'Active': return '#64B5F6';
    case 'Marketing': return '#FFB74D';
    case 'On Hold': return '#FFE0B2';
    default: return theme.tint;
  }
}

function getProgressColor(progress: number, theme: typeof Colors.light) {
  if (progress >= 80) return theme.status.completed;
  if (progress >= 50) return '#FFB74D';
  return theme.tint;
}

const createStyles = (theme: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: theme.tintDark },
  headerRight: { flexDirection: 'row', gap: 16 },
  headerIcon: { padding: 4 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 14 },
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
  searchInput: { flex: 1, fontSize: 14, color: theme.text, padding: 0 },
  tabRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, gap: 20 },
  tabText: { fontSize: 15, fontWeight: '500', color: theme.textSecondary },
  tabTextActive: { color: theme.tint, fontWeight: '600' },
  newProjectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.tint, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginLeft: 'auto', gap: 6 },
  newProjectText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 8, zIndex: 10 },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.cardSecondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 8 },
  filterText: { fontSize: 13, color: theme.text },
  dropdownMenu: { marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  dropdownItemActive: { backgroundColor: theme.tint + '15' },
  dropdownItemText: { fontSize: 14, color: theme.text },
  dropdownItemTextActive: { color: theme.tint, fontWeight: '600' },
  allProjectsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginVertical: 12, paddingVertical: 12, backgroundColor: theme.tint + '15', borderRadius: 12, gap: 8 },
  allProjectsText: { fontSize: 14, fontWeight: '600', color: theme.tint },
  projectsList: { paddingHorizontal: 16, gap: 16, paddingBottom: 30 },
  projectCard: { backgroundColor: theme.cardSecondary, borderRadius: 16, padding: 16 },
  projectName: { fontSize: 17, fontWeight: '600', color: theme.text, marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tagText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  companyBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.info + '22', borderWidth: 1, borderColor: theme.info + '77' },
  companyText: { fontSize: 12, fontWeight: '700', color: theme.info },
  progressSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  progressBar: { flex: 1, height: 8, backgroundColor: theme.border, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  progressPercent: { fontSize: 14, fontWeight: '600', color: theme.text, marginLeft: 12, minWidth: 36 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  footerLeft: { flexDirection: 'row', gap: 16 },
  dueDate: { fontSize: 13, color: theme.textSecondary },
  taskCount: { fontSize: 13, color: theme.textSecondary },
  membersRow: { flexDirection: 'row', alignItems: 'center' },
  memberAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: theme.cardSecondary },
  arrowButton: { marginLeft: 8 },
  arrowText: { fontSize: 20, color: theme.textSecondary },
  description: { fontSize: 13, color: theme.textSecondary, marginTop: 8 },
});
