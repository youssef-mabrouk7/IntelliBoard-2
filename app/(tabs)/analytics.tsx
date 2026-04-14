import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Filter, Check, AlertCircle, FileText, Clock, Briefcase, Users } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import SideDrawer from '@/components/SideDrawer';
import { supabaseService } from '@/services/supabaseService';
import { Project, Task, Team } from '@/constants/types';

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [overviewRange, setOverviewRange] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [tasksData, projectsData, teamsData] = await Promise.all([
          supabaseService.getTasks(),
          supabaseService.getProjects(),
          supabaseService.getTeams(),
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
        setTeams(teamsData);
      } catch (e: any) {
        setError(e?.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const analyticsData = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const overdue = tasks.filter((t) => t.status === 'overdue').length;
    const ongoing = tasks.filter((t) => t.status === 'inProgress').length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status !== 'archived').length;
    const totalTeams = teams.length;
    const avgTeamProgress =
      totalTeams === 0 ? 0 : Math.round(teams.reduce((sum, t) => sum + (t.progress ?? 0), 0) / totalTeams);
    return {
      totalTasks: tasks.length,
      completed,
      overdue,
      overdued: overdue,
      ongoing,
      totalProjects,
      activeProjects,
      totalTeams,
      avgTeamProgress,
      weeklyData: [
        { day: 'Mon', completed, overdue },
        { day: 'Tue', completed, overdue },
        { day: 'Wed', completed, overdue },
        { day: 'Thu', completed, overdue },
        { day: 'Fri', completed, overdue },
        { day: 'Sat', completed, overdue },
        { day: 'Sun', completed, overdue },
      ],
    };
  }, [tasks]);

  const chartData = {
    labels: analyticsData.weeklyData.map(d => d.day),
    datasets: [
      {
        data: analyticsData.weeklyData.map(d => d.completed),
        color: () => Colors.light.tint,
        strokeWidth: 2,
      },
      {
        data: analyticsData.weeklyData.map(d => d.overdue),
        color: () => Colors.light.priority.high,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Menu size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={16} color={Colors.light.textSecondary} />
          <Text style={styles.filterText}>This Week</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <ActivityIndicator color={Colors.light.tint} />
          </View>
        )}
        {!!error && (
          <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <Text style={{ color: Colors.light.error }}>{error}</Text>
          </View>
        )}

        <View style={styles.timeRangeTabs}>
          {(['Week', 'Month', 'Year'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeTab, timeRange === range && styles.timeTabActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.timeTabText, timeRange === range && styles.timeTabTextActive]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.overviewSection}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <TouchableOpacity>
              <Text style={styles.moreOptions}>...</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.overviewTabs}>
            {(['Week', 'Month', 'Year'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.overviewTab, overviewRange === range && styles.overviewTabActive]}
                onPress={() => setOverviewRange(range)}
              >
                <Text style={[styles.overviewTabText, overviewRange === range && styles.overviewTabTextActive]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.legend}>
            <TouchableOpacity 
              style={styles.legendItem}
              onPress={() => router.push('/all-tasks' as const)}
            >
              <View style={[styles.legendIcon, { backgroundColor: Colors.light.tint + '20' }]}>
                <Check size={16} color={Colors.light.tint} />
              </View>
              <Text style={styles.legendText}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.legendItem}
              onPress={() => router.push('/all-tasks' as const)}
            >
              <View style={[styles.legendIcon, { backgroundColor: Colors.light.priority.high + '20' }]}>
                <AlertCircle size={16} color={Colors.light.priority.high} />
              </View>
              <Text style={styles.legendText}>Overdue</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            {Platform.OS !== 'web' ? (
              <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 32}
                height={220}
                chartConfig={{
                  backgroundColor: Colors.light.card,
                  backgroundGradientFrom: Colors.light.card,
                  backgroundGradientTo: Colors.light.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(74, 124, 155, ${opacity})`,
                  labelColor: () => Colors.light.textSecondary,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#fff',
                  },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.webChartFallback}>
                <Text style={styles.webChartText}>Chart view available on mobile app</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/all-tasks' as const)}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <FileText size={24} color={Colors.light.status.completed} />
            </View>
            <Text style={styles.statNumber}>{analyticsData.totalTasks}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/all-tasks' as const)}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <Check size={24} color={Colors.light.tint} />
            </View>
            <Text style={styles.statNumber}>{analyticsData.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push('/all-tasks' as const)}>
            <View style={[styles.statIcon, { backgroundColor: '#FFEBEE' }]}>
              <AlertCircle size={24} color={Colors.light.priority.high} />
            </View>
            <Text style={styles.statNumber}>{analyticsData.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomStatsRow}>
          <View style={[styles.bottomStatCard, { flex: 1 }]}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <Clock size={24} color={Colors.light.tint} />
            </View>
            <View>
              <Text style={styles.statNumber}>{analyticsData.ongoing}</Text>
              <Text style={styles.statLabel}>Ongoing</Text>
            </View>
          </View>
          <View style={[styles.bottomStatCard, { flex: 1 }]}>
            <View style={[styles.statIcon, { backgroundColor: '#E8EAF6' }]}>
              <Briefcase size={24} color="#7B8CDE" />
            </View>
            <View>
              <Text style={styles.statNumber}>{analyticsData.totalProjects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
          </View>
          <View style={[styles.bottomStatCard, { flex: 1 }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
              <Users size={24} color="#FFB74D" />
            </View>
            <View>
              <Text style={styles.statNumber}>{analyticsData.totalTeams}</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SideDrawer isVisible={drawerVisible} onClose={() => setDrawerVisible(false)} />
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  timeRangeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  timeTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  timeTabActive: {
    backgroundColor: Colors.light.tint,
  },
  timeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  timeTabTextActive: {
    color: '#FFFFFF',
  },
  overviewSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  moreOptions: {
    fontSize: 20,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  overviewTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  overviewTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.light.cardSecondary,
  },
  overviewTabActive: {
    backgroundColor: Colors.light.tint,
  },
  overviewTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  overviewTabTextActive: {
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  chartContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  webChartFallback: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
  },
  webChartText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  bottomStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 30,
  },
  bottomStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
});
