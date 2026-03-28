import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Menu, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { calendarEvents, currentUser } from '@/constants/mockData';
import SideDrawer from '@/components/SideDrawer';

export default function CalendarScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Menu size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calender</Text>
        <Image source={{ uri: currentUser.avatar }} style={styles.headerAvatar} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.monthSelector}>
          <TouchableOpacity>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.monthText}>April 2024</Text>
          <TouchableOpacity>
            <ChevronRight size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <Text key={day} style={styles.weekDayLabel}>{day}</Text>
          ))}
        </View>

        <View style={styles.daysRow}>
          {[18, 19, 20, 17, 18, 19, 20].map((day, index) => (
            <View key={index} style={styles.dayCell}>
              <Text style={[
                styles.dayNumber,
                day === 17 && styles.dayNumberToday,
              ]}>{day}</Text>
              {day === 17 && <View style={styles.todayDot} />}
            </View>
          ))}
        </View>

        <View style={styles.selectedDateSection}>
          <Text style={styles.selectedDateText}>Wednesday , April 17</Text>
          <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/all-events' as const)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventsList}>
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
                    <Text style={styles.eventTimeRange}>{event.startTime} _ {event.endTime}</Text>
                    {event.taskCount && (
                      <View style={styles.taskProgress}>
                        <Text style={styles.taskProgressText}>{event.taskCount} Tasks</Text>
                        <View style={styles.miniProgressBar}>
                          <View style={[styles.miniProgressFill, { width: '60%' }]} />
                        </View>
                      </View>
                    )}
                    {event.assignee && (
                      <Text style={styles.assigneeText}>{event.assignee}</Text>
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
                      <View style={styles.moreBadge}>
                        <Text style={styles.moreText}>+5</Text>
                      </View>
                    </View>
                    <View style={styles.eventArrow}>
                      <Text style={styles.arrowText}>›</Text>
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

        <TouchableOpacity style={styles.newEventButton} onPress={() => router.push('/new-event')}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.newEventText}>New Event</Text>
        </TouchableOpacity>
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
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekDayLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'relative',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dayNumberToday: {
    color: '#2196F3',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
    marginTop: 4,
  },
  selectedDateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.tint + '20',
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.tint,
  },
  eventsList: {
    paddingHorizontal: 16,
    gap: 12,
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
  assigneeText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  eventRightSection: {
    alignItems: 'flex-end',
  },
  assigneesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assigneeAvatar: {
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
  eventArrow: {
    padding: 4,
  },
  arrowText: {
    fontSize: 20,
    color: Colors.light.textSecondary,
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
  newEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 30,
    gap: 8,
  },
  newEventText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
