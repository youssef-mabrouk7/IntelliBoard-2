import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Project } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

export default function CollaborationsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = Colors.current;
  const styles = createStyles(theme);
  useEffect(() => {
    const load = async () => {
      const data = await supabaseService.getProjects();
      setProjects(data);
      setLoading(false);
    };
    load();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
    

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Together</Text>
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
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/create-team')}>
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
});
