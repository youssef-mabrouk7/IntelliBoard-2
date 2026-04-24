import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Team } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

export default function AllTeamsScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Archived'>('All');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const data = await supabaseService.getTeams();
        setTeams(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredTeams = teams.filter((team) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return team.progress < 100;
    if (activeFilter === 'Archived') return team.progress === 100;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Teams</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Search size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Users size={24} color="#FFFFFF" />
            <Text style={styles.statNumber}>{teams.length}</Text>
            <Text style={styles.statLabel}>Total Teams</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4CAF90' }]}>
            <Users size={24} color="#FFFFFF" />
            <Text style={styles.statNumber}>{teams.filter(t => t.progress < 100).length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['All', 'Active', 'Archived'] as const).map((filter) => (
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

        <View style={styles.teamsList}>
          {loading && <ActivityIndicator color={theme.tint} />}
          {!!error && <Text style={styles.viewDetailsText}>{error}</Text>}
          {filteredTeams.map((team) => (
            <TouchableOpacity key={team.id} style={styles.teamCard} onPress={() => router.push(`/team/${team.id}`)}>
              <View style={styles.teamHeader}>
                <View style={[styles.teamIcon, { backgroundColor: team.color }]}>
                  <Text style={styles.teamIconText}>{team.name.charAt(0)}</Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.memberCount}>{team.memberCount} Members</Text>
                </View>
              </View>
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>{team.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${team.progress}%`, backgroundColor: team.color }]} />
                </View>
              </View>
              <View style={styles.membersSection}>
                <View style={styles.membersRow}>
                  {team.members.slice(0, 5).map((member, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: member.avatar || 'https://via.placeholder.com/60' }}
                      style={[styles.memberAvatar, { marginLeft: idx > 0 ? -10 : 0 }]}
                    />
                  ))}
                </View>
                <Text style={styles.viewDetailsText}>View Details</Text>
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.tint,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 8,
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
  teamsList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 100,
  },
  teamCard: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.tintDark,
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  membersSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
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
  viewDetailsText: {
    fontSize: 13,
    color: theme.tint,
    fontWeight: '500',
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
