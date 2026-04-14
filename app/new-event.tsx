import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, Users, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { supabaseService } from '@/services/supabaseService';
import { useDateDraftStore } from '@/stores/dateDraftStore';

export default function NewEventScreen() {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const dateDraft = useDateDraftStore((s) => s.byContext.event);
  const todayISO = new Date().toISOString().slice(0, 10);
  const date = dateDraft?.dateISO ?? todayISO;
  const [startTime] = useState('10:00 AM');
  const [endTime] = useState('11:00 AM');
  const [creating, setCreating] = useState(false);

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
        color: Colors.light.tint,
        status: description.trim() ? description.trim() : undefined,
      });
      Alert.alert('Success', 'Event created successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Create Event Failed', error?.message || 'Unknown error.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Event</Text>
        <TouchableOpacity style={[styles.createButton, creating && { opacity: 0.7 }]} onPress={handleCreate} disabled={creating}>
          {creating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.createButtonText}>Create</Text>}
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
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add event description..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          <View style={styles.optionsList}>
            <TouchableOpacity style={styles.optionRow} onPress={() => router.push({ pathname: '/select-due-date', params: { context: 'event' } })}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Calendar size={18} color={Colors.light.tint} />
                </View>
                <Text style={styles.optionLabel}>Date</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{date}</Text>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Clock size={18} color={Colors.light.status.completed} />
                </View>
                <Text style={styles.optionLabel}>Start Time</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{startTime}</Text>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Clock size={18} color={Colors.light.priority.high} />
                </View>
                <Text style={styles.optionLabel}>End Time</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{endTime}</Text>
                <ChevronRight size={18} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8EAF6' }]}>
                  <Users size={18} color="#7B8CDE" />
                </View>
                <Text style={styles.optionLabel}>Invite Participants</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder</Text>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderText}>15 minutes before</Text>
            <ChevronRight size={18} color={Colors.light.textSecondary} />
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
  createButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputSection: {
    backgroundColor: Colors.light.cardSecondary,
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
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  section: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
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
    borderBottomColor: Colors.light.border,
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
    color: Colors.light.text,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionValue: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  reminderText: {
    fontSize: 15,
    color: Colors.light.text,
  },
});
