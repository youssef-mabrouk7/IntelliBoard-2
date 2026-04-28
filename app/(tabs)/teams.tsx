import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Menu, Search, Bell, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import SideDrawer from '@/components/SideDrawer';
import { Team } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';
import { useFocusEffect } from '@react-navigation/native';

export default function TeamsScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseService.getTeams();
      setTeams(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTeams();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Menu size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teams</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/all-teams')}>
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
            <Search size={20} color={theme.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search Team...</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Teams</Text>
          <TouchableOpacity onPress={() => router.push('/all-teams' as const)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.teamsList}>
          {loading && <ActivityIndicator color={theme.tint} />}
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          {!loading && !error && teams.map((team) => (
            <TouchableOpacity key={team.id} style={styles.teamCard} onPress={() => router.push(`/team/${team.id}`)}>
              {/* Team header row — icon + name + member count */}
              <View style={styles.teamHeader}>
                <View style={[styles.teamIconCircle, { backgroundColor: team.color || theme.tint }]}>
                  <Text style={styles.teamIconText}>{team.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.memberCount}>{team.memberCount} Members</Text>
                </View>
              </View>

              {/* Member avatars */}
              <View style={styles.membersRow}>
                {team.members.slice(0, 4).map((member, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: member.avatar || 'https://via.placeholder.com/60' }}
                    style={[styles.memberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                  />
                ))}
                {team.memberCount > 4 && (
                  <View style={styles.moreBadge}>
                    <Text style={styles.moreText}>+{team.memberCount - 4}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <SideDrawer isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />

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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: theme.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
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
  teamsList: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 100,
  },
  teamCard: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.cardSecondary,
  },
  moreBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '700',
  },
  errorText: {
    color: theme.error,
    fontSize: 14,
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
