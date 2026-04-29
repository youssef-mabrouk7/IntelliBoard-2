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
import { useLocalization } from '@/utils/localization';
import { saveEventReminder } from '@/services/reminderNotifications';
import { supabase } from '@/utils/supabase';

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM',
];
const REMINDER_OPTIONS = [5, 10, 15, 30, 60, 120, 1440];

export default function NewEventScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const dateDraft = useDateDraftStore((s) => s.byContext.event);
  const clearDateDraft = useDateDraftStore((s) => s.clearDateDraft);
  const todayISO = new Date().toISOString().slice(0, 10);
  const date = dateDraft?.dateISO ?? todayISO;

  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [creating, setCreating] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteDraftEmails, setInviteDraftEmails] = useState('');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [resolvingInvites, setResolvingInvites] = useState(false);

  // 'start' | 'end' | null
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleCreate = async () => {
    if (!eventName.trim()) {
      Alert.alert('Validation', 'Event name is required.');
      return;
    }
    try {
      setCreating(true);
      const createdEvent = await supabaseService.createEvent({
        title: eventName.trim(),
        date,
        startTime,
        endTime,
        color: theme.tint,
        status: description.trim() ? description.trim() : undefined,
      }, selectedParticipantIds);
      await saveEventReminder(createdEvent.id, reminderMinutes);
      const invitesSent = selectedParticipantIds.length > 0 ? await supabaseService.getEventInvitesCount(createdEvent.id) : 0;
      // Clear the date draft so the next event starts fresh
      clearDateDraft('event');
      if (selectedParticipantIds.length > 0 && invitesSent === 0) {
        Alert.alert(
          'Event created',
          "Invites were confirmed, but 0 invites were saved. This usually means your Supabase database is missing the `event_invites` RLS policies (or insert is blocked). Please apply the `event_invites` section from `supabase/schema.sql`.",
        );
      } else {
        Alert.alert(
          'Success',
          `Event created successfully.${selectedParticipantIds.length > 0 ? ` Invites sent: ${invitesSent}.` : ''}`,
        );
      }
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

  const handleConfirmInviteEmails = async () => {
    try {
      setResolvingInvites(true);
      const enteredEmails = inviteDraftEmails
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      if (enteredEmails.length === 0) {
        setInviteEmails('');
        setSelectedParticipantIds([]);
        setShowInviteModal(false);
        Alert.alert('Done', 'Invite list cleared.');
        return;
      }

      const { profileIds, missingEmails } = await supabaseService.resolveProfileIdsByEmails(enteredEmails);
      if (missingEmails.length > 0) {
        Alert.alert('Error', `No user found with: ${missingEmails.join(', ')}`);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const myId = authData.user?.id;
      const filteredIds = profileIds.filter((id) => id !== myId);
      if (filteredIds.length === 0) {
        Alert.alert('Error', 'You cannot invite yourself. Please enter another user email.');
        return;
      }

      setInviteEmails(enteredEmails.join(', '));
      setSelectedParticipantIds(filteredIds);
      setShowInviteModal(false);
      Alert.alert('Success', `Invitation emails confirmed. Inviting: ${filteredIds.length} user(s).`);
    } catch (error: any) {
      Alert.alert('Invite Error', error?.message || 'Could not validate invite emails.');
    } finally {
      setResolvingInvites(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('newEventTitle')}</Text>
        <TouchableOpacity
          style={[styles.createButton, creating && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>{t('create')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('eventName')}</Text>
            <TextInput
              style={styles.textInput}
              value={eventName}
              onChangeText={setEventName}
              placeholder={t('eventNamePlaceholder')}
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('description')}</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder={t('descriptionPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('eventDetailsSection')}</Text>

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
                <Text style={styles.optionLabel}>{t('dateLabel')}</Text>
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
                <Text style={styles.optionLabel}>{t('startTimeLabel')}</Text>
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
                <Text style={styles.optionLabel}>{t('endTimeLabel')}</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>{endTime}</Text>
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Invite participants (future feature placeholder) */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setInviteDraftEmails(inviteEmails);
                setShowInviteModal(true);
              }}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: theme.tint + '20' }]}>
                  <Users size={18} color={theme.tint} />
                </View>
                <Text style={styles.optionLabel}>{t('inviteParticipants')}</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>
                  {selectedParticipantIds.length > 0 ? `${selectedParticipantIds.length} invited` : 'Tap to add'}
                </Text>
                <ChevronRight size={18} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
            {!!inviteEmails && <Text style={styles.optionValue}>{inviteEmails}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reminderLabel')}</Text>
          <TouchableOpacity style={styles.reminderRow} onPress={() => setShowReminderModal(true)}>
            <Text style={styles.reminderText}>
              {reminderMinutes === 1440 ? '1 day before' : `${reminderMinutes} minutes before`}
            </Text>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>
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
                {t('selectTime')} ({timePickerTarget === 'start' ? t('startTimeLabel') : t('endTimeLabel')})
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
      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowInviteModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('inviteParticipants')}</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              value={inviteDraftEmails}
              onChangeText={setInviteDraftEmails}
              placeholder="Write participant emails separated by comma"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              multiline
            />
            <TouchableOpacity
              style={[styles.createButton, { marginTop: 14 }, resolvingInvites && { opacity: 0.7 }]}
              onPress={handleConfirmInviteEmails}
              disabled={resolvingInvites}
            >
              <Text style={styles.createButtonText}>{resolvingInvites ? 'Checking...' : 'Confirm invites'}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={showReminderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowReminderModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('reminderLabel')}</Text>
              <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.timeGrid}>
              {REMINDER_OPTIONS.map((minutes) => {
                const selected = minutes === reminderMinutes;
                const label = minutes === 1440 ? '1 day before' : `${minutes} min before`;
                return (
                  <TouchableOpacity
                    key={minutes}
                    style={[styles.timeSlot, selected && styles.timeSlotSelected]}
                    onPress={() => {
                      setReminderMinutes(minutes);
                      setShowReminderModal(false);
                    }}
                  >
                    <Text style={[styles.timeSlotText, selected && styles.timeSlotTextSelected]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
