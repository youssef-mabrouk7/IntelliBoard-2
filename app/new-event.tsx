import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, Users, ChevronRight, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabaseService } from '@/services/supabaseService';
import { useDateDraftStore } from '@/stores/dateDraftStore';

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM',
];

export default function NewEventScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const dateDraft = useDateDraftStore((s) => s.byContext.event);
  const clearDateDraft = useDateDraftStore((s) => s.clearDateDraft);
  const todayISO = new Date().toISOString().slice(0, 10);
  const date = dateDraft?.dateISO ?? todayISO;

  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [creating, setCreating] = useState(false);

  // 'start' | 'end' | null
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(null);

  const handleCreate = async () => {
    if (!eventName.trim()) {
      Alert.alert('Validation', 'Event name is required.');
      return;
    }
    try {
      setCreating(true);
      await supabaseService.createEvent({
        title: eventName.trim(),
        date,
        startTime,
        endTime,
        color: theme.tint,
        status: description.trim() ? description.trim() : undefined,
      });
      // Clear the date draft so the next event starts fresh
      clearDateDraft('event');
      Alert.alert('Success', 'Event created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Create Event Failed', error?.message || 'Unknown error.');
    } finally {
      setCreating(false);
    }
  };

  const handleSelectTime = (slot: string) => {
    if (timePickerTarget === 'start') {
      setStartTime(slot);
    } else if (timePickerTarget === 'end') {
      setEndTime(slot);
    }
    setTimePickerTarget(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Event</Text>
        <TouchableOpacity
          style={[styles.createButton, creating && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Name</Text>
            <TextInput
              style={styles.textInput}
              value={eventName}
              onChangeText={setEventName}
              placeholder="Enter event name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add event description..."
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.optionsList}>
            {/* Date picker — navigates to select-due-date */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() =>
                router.push({ pathname: '/select-due-date', params: { context: 'event' } })
              }
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: theme.tint + '20' }]}>
                  <Calendar size={18} color={theme.tint} />
                </View>
                <Text style={styles.optionLabel}>Date</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{date}</Text>
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Start time picker */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setTimePickerTarget('start')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: theme.status.completed + '20' }]}>
                  <Clock size={18} color={theme.status.completed} />
                </View>
                <Text style={styles.optionLabel}>Start Time</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{startTime}</Text>
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* End time picker */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setTimePickerTarget('end')}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: theme.priority.high + '20' }]}>
                  <Clock size={18} color={theme.priority.high} />
                </View>
                <Text style={styles.optionLabel}>End Time</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{endTime}</Text>
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Invite participants (future feature placeholder) */}
            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8EAF6' }]}>
                  <Users size={18} color="#7B8CDE" />
                </View>
                <Text style={styles.optionLabel}>Invite Participants</Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder</Text>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderText}>15 minutes before</Text>
            <ChevronRight size={18} color={theme.textSecondary} />
          </View>
        </View>
      </ScrollView>

      {/* Time picker modal */}
      <Modal
        visible={timePickerTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setTimePickerTarget(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTimePickerTarget(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {timePickerTarget === 'start' ? 'Start' : 'End'} Time
              </Text>
              <TouchableOpacity onPress={() => setTimePickerTarget(null)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.timeGrid}>
                {TIME_SLOTS.map((slot) => {
                  const isSelected =
                    timePickerTarget === 'start' ? startTime === slot : endTime === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                      onPress={() => handleSelectTime(slot)}
                    >
                      <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  createButton: {
    backgroundColor: theme.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputSection: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.text,
  },
  section: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  optionsList: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 15,
    color: theme.text,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionValue: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  reminderText: {
    fontSize: 15,
    color: theme.text,
  },
  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 24,
  },
  timeSlot: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.cardSecondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  timeSlotSelected: {
    backgroundColor: theme.tint,
    borderColor: theme.tint,
  },
  timeSlotText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
