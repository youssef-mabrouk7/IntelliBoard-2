import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function SelectDueDateScreen() {
  const [selectedDate, setSelectedDate] = useState(17);
  const [currentMonth] = useState('April 2024');

  const dates = [
    { day: 14, month: 'prev' },
    { day: 15, month: 'prev' },
    { day: 16, month: 'prev' },
    { day: 17, month: 'current', selected: true },
    { day: 18, month: 'current' },
    { day: 19, month: 'current' },
    { day: 20, month: 'current' },
    { day: 21, month: 'current' },
    { day: 22, month: 'current' },
    { day: 23, month: 'current' },
    { day: 24, month: 'current' },
    { day: 25, month: 'current' },
    { day: 26, month: 'current' },
    { day: 27, month: 'current' },
    { day: 28, month: 'current' },
    { day: 29, month: 'current' },
    { day: 30, month: 'current' },
    { day: 1, month: 'next' },
    { day: 2, month: 'next' },
    { day: 3, month: 'next' },
    { day: 4, month: 'next' },
  ];

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

  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  const handleSave = () => {
    router.back();
  };

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
          <TouchableOpacity>
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentMonth}</Text>
          <TouchableOpacity>
            <ChevronRight size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.weekDayLabel}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {dates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCell,
                date.day === selectedDate && date.month === 'current' && styles.dateCellSelected,
                date.month !== 'current' && styles.dateCellMuted,
              ]}
              onPress={() => date.month === 'current' && setSelectedDate(date.day)}
            >
              <Text
                style={[
                  styles.dateText,
                  date.day === selectedDate && date.month === 'current' && styles.dateTextSelected,
                  date.month !== 'current' && styles.dateTextMuted,
                ]}
              >
                {date.day}
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
