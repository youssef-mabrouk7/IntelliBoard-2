import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Menu, Search, Bell, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { teams } from '@/constants/mockData';
import SideDrawer from '@/components/SideDrawer';

export default function TeamsScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Menu size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teams</Text>
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
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textSecondary} />
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
          {teams.map((team) => (
            <TouchableOpacity key={team.id} style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.memberCount}>{team.memberCount} Members</Text>
              </View>
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Progress: {team.progress}%</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${team.progress}%` }]} />
                  </View>
                  <View style={styles.membersRow}>
                    {team.members.slice(0, 3).map((member, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: member.avatar }}
                        style={[styles.memberAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                      />
                    ))}
                    <View style={styles.moreBadge}>
                      <Text style={styles.moreText}>+{team.memberCount - 3}</Text>
                    </View>
                  </View>
                </View>
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: Colors.light.textSecondary,
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
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  teamsList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 100,
  },
  teamCard: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    padding: 16,
  },
  teamHeader: {
    marginBottom: 12,
  },
  teamName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.tintDark,
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#7B8CDE',
    borderRadius: 3,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.cardSecondary,
  },
  moreBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
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
