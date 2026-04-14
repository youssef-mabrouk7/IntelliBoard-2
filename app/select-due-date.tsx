import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useDateDraftStore, type DateDraftContext } from '@/stores/dateDraftStore';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const toISODate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseISODate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(year, month, day);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const addMonths = (base: Date, delta: number) => {
  const d = new Date(base);
  d.setMonth(d.getMonth() + delta);
  return d;
};

const addYears = (base: Date, delta: number) => {
  const d = new Date(base);
  d.setFullYear(d.getFullYear() + delta);
  return d;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const monthName = (d: Date) =>
  d.toLocaleString('en-US', { month: 'long' });

export default function SelectDueDateScreen() {
  const params = useLocalSearchParams<{ context?: string }>();
  const context = (params.context as DateDraftContext | undefined) ?? 'task';
  const setDateDraft = useDateDraftStore((s) => s.setDateDraft);
  const draft = useDateDraftStore((s) => s.byContext[context]);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const fromDraft = draft?.dateISO ? parseISODate(draft.dateISO) : null;
    return fromDraft ?? new Date();
  });
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(selectedDate));

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ];

  const [selectedTime, setSelectedTime] = useState(draft?.time ?? '10:00 AM');

  const handleSave = () => {
    setDateDraft(context, { dateISO: toISODate(selectedDate), time: selectedTime });
    router.back();
  };

  const calendarCells = useMemo(() => {
    const first = startOfMonth(visibleMonth);
    const firstWeekday = first.getDay(); // 0..6
    const start = new Date(first);
    start.setDate(first.getDate() - firstWeekday);

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ date: d, isCurrentMonth: d.getMonth() === visibleMonth.getMonth() && d.getFullYear() === visibleMonth.getFullYear() });
    }
    return cells;
  }, [visibleMonth]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Due Date</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => setVisibleMonth((m) => startOfMonth(addMonths(m, -1)))}>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {monthName(visibleMonth)} {visibleMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => setVisibleMonth((m) => startOfMonth(addMonths(m, 1)))}>
            <ChevronRight size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.yearAdjustRow}>
          <TouchableOpacity style={styles.yearAdjustBtn} onPress={() => setVisibleMonth((m) => startOfMonth(addYears(m, -1)))}>
            <Text style={styles.yearAdjustText}>- Year</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayBtn} onPress={() => {
            const today = new Date();
            setSelectedDate(today);
            setVisibleMonth(startOfMonth(today));
          }}>
            <Text style={styles.todayText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yearAdjustBtn} onPress={() => setVisibleMonth((m) => startOfMonth(addYears(m, 1)))}>
            <Text style={styles.yearAdjustText}>+ Year</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.weekDayLabel}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarCells.map((cell, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCell,
                sameDay(cell.date, selectedDate) && styles.dateCellSelected,
                !cell.isCurrentMonth && styles.dateCellMuted,
              ]}
              onPress={() => {
                setSelectedDate(cell.date);
                if (!cell.isCurrentMonth) setVisibleMonth(startOfMonth(cell.date));
              }}
            >
              <Text
                style={[
                  styles.dateText,
                  sameDay(cell.date, selectedDate) && styles.dateTextSelected,
                  !cell.isCurrentMonth && styles.dateTextMuted,
                ]}
              >
                {cell.date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.timeSectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  selectedTime === time && styles.timeButtonSelected,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    selectedTime === time && styles.timeButtonTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
  saveButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  yearAdjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  yearAdjustBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  yearAdjustText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
  },
  todayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  dateCell: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginBottom: 8,
  },
  dateCellSelected: {
    backgroundColor: Colors.light.tint,
  },
  dateCellMuted: {
    opacity: 0.4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  dateTextMuted: {
    color: Colors.light.textSecondary,
  },
  timeSection: {
    paddingHorizontal: 16,
    marginTop: 30,
  },
  timeSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timeButtonSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  timeButtonText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  timeButtonTextSelected: {
    color: '#FFFFFF',
  },
});
