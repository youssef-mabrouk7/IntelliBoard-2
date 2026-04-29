import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Mail, MessageSquare, Calendar, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLocalization } from '@/utils/localization';
import { useFocusEffect } from '@react-navigation/native';
import { supabaseService } from '@/services/supabaseService';
import { getReminderNotifications, setReminderNotificationRead, type ReminderNotificationItem } from '@/services/reminderNotifications';
import { EventInvite } from '@/constants/types';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function NotificationsSettingsScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);
  const { t } = useLocalization();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: <Bell size={18} color={theme.tint} />,
      enabled: true,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive email updates about your tasks',
      icon: <Mail size={18} color="#E57373" />,
      enabled: true,
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Get notified when someone sends you a message',
      icon: <MessageSquare size={18} color="#4CAF90" />,
      enabled: false,
    },
    {
      id: 'events',
      title: 'Calendar Events',
      description: 'Reminders for upcoming events and meetings',
      icon: <Calendar size={18} color="#9C7BB8" />,
      enabled: true,
    },
    {
      id: 'tasks',
      title: 'Task Updates',
      description: 'Notifications when tasks are assigned or completed',
      icon: <CheckCircle size={18} color="#FFB74D" />,
      enabled: true,
    },
  ]);
  const [reminders, setReminders] = useState<ReminderNotificationItem[]>([]);
  const [eventInvites, setEventInvites] = useState<EventInvite[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadReminderNotifications = async () => {
        try {
          const [events, invites] = await Promise.all([
            supabaseService.getEvents(),
            supabaseService.getMyPendingEventInvites(),
          ]);
          const items = await getReminderNotifications(events);
          setReminders(items);
          setEventInvites(invites);
        } catch {
          setReminders([]);
          setEventInvites([]);
        }
      };
      loadReminderNotifications();
    }, []),
  );

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const toggleReminderRead = async (eventId: string, nextRead: boolean) => {
    await setReminderNotificationRead(eventId, nextRead);
    setReminders((prev) =>
      prev.map((item) => (item.eventId === eventId ? { ...item, isRead: nextRead } : item)),
    );
  };

  const respondInvite = async (inviteId: string, accept: boolean) => {
    await supabaseService.respondToEventInvite(inviteId, accept);
    setEventInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notificationsTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            Customize how you want to be notified about activity in your workspace.
          </Text>
        </View>

        <View style={styles.settingsList}>
          {settings.map((setting, index) => (
            <View key={setting.id} style={[styles.settingItem, index === settings.length - 1 && styles.settingItemLast]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.card }]}>
                  {setting.icon}
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: theme.border, true: theme.tint }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.quietHoursButton}>
          <Text style={styles.quietHoursTitle}>Quiet Hours</Text>
          <Text style={styles.quietHoursDescription}>
            Pause notifications during specific hours
          </Text>
        </TouchableOpacity>

        <View style={styles.reminderSection}>
          <Text style={styles.quietHoursTitle}>Event invites</Text>
          {eventInvites.length === 0 ? (
            <Text style={styles.quietHoursDescription}>No pending event invitations.</Text>
          ) : (
            eventInvites.map((invite) => (
              <View key={invite.id} style={styles.reminderCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>Invitation: {invite.event?.title ?? 'Event'}</Text>
                  <Text style={styles.settingDescription}>
                    {invite.inviter?.name || 'Someone'} invited you ({invite.event?.startTime ?? ''})
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.readToggle}
                  onPress={() => respondInvite(invite.id, false)}
                >
                  <Text style={styles.readToggleText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.readToggle, { borderColor: theme.tint }]}
                  onPress={() => respondInvite(invite.id, true)}
                >
                  <Text style={styles.readToggleText}>Accept</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.reminderSection}>
          <Text style={styles.quietHoursTitle}>Event reminders</Text>
          {reminders.length === 0 ? (
            <Text style={styles.quietHoursDescription}>No triggered reminders yet.</Text>
          ) : (
            reminders.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.reminderCard}
                onPress={() => router.push(`/event/${item.eventId}` as const)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.body}</Text>
                </View>
                <TouchableOpacity
                  style={styles.readToggle}
                  onPress={() => toggleReminderRead(item.eventId, !item.isRead)}
                >
                  <Text style={styles.readToggleText}>{item.isRead ? 'Mark unread' : 'Mark read'}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
  descriptionSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  settingsList: {
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  quietHoursButton: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: theme.cardSecondary,
    borderRadius: 16,
    padding: 16,
  },
  quietHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  quietHoursDescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  reminderSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    gap: 10,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.cardSecondary,
    borderRadius: 12,
    padding: 12,
  },
  readToggle: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  readToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.tint,
  },
});
