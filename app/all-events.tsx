import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { CalendarEvent } from '@/constants/types';
import { supabaseService } from '@/services/supabaseService';

export default function AllEventsScreen() {
  const [currentMonth] = useState('April 2024');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await supabaseService.getEvents();
      setCalendarEvents(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Events</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Calendar size={22} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.monthSelector}>
          <TouchableOpacity>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentMonth}</Text>
          <TouchableOpacity>
            <ChevronRight size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{calendarEvents.length}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.min(7, calendarEvents.length)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{calendarEvents.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.eventsList}>
            {loading && <ActivityIndicator color={Colors.light.tint} />}
            {calendarEvents.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={styles.eventTimeColumn}>
                  <Text style={styles.eventTime}>{event.startTime}</Text>
                  <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                </View>
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleSection}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventTimeRange}>{event.startTime} - {event.endTime}</Text>
                      {event.taskCount && (
                        <View style={styles.taskProgress}>
                          <Text style={styles.taskProgressText}>{event.taskCount} Tasks</Text>
                          <View style={styles.miniProgressBar}>
                            <View style={[styles.miniProgressFill, { width: '60%' }]} />
                          </View>
                        </View>
                      )}
                    </View>
                    <View style={styles.eventRightSection}>
                      <View style={styles.assigneesRow}>
                        {event.assignees.slice(0, 3).map((assignee, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: assignee.avatar }}
                            style={[styles.assigneeAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  {event.status && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{event.status}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/new-event')}>
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
  headerIcon: {
    padding: 4,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
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
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  eventsList: {
    gap: 12,
    paddingBottom: 100,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 12,
    padding: 12,
  },
  eventTimeColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitleSection: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  eventTimeRange: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskProgressText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  miniProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    maxWidth: 80,
  },
  miniProgressFill: {
    height: 4,
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
  },
  eventRightSection: {
    alignItems: 'flex-end',
  },
  assigneesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.cardSecondary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C8F6D8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.status.completed,
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
