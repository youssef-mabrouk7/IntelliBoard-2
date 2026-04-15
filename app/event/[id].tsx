import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Calendar, Clock, Paperclip } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { supabaseService } from '@/services/supabaseService';
import type { CalendarEvent } from '@/constants/types';
import { useLocalization } from '@/utils/localization';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Array.isArray(id) ? id[0] : id;
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLocalization();

  useEffect(() => {
    const load = async () => {
      if (!eventId) return;
      setLoading(true);
      const events = await supabaseService.getEvents();
      setEvent(events.find((item) => item.id === eventId) ?? null);
      setLoading(false);
    };
    load();
  }, [eventId]);

  const attachments = useMemo(() => (event?.status ? [{ id: '1', name: event.status }] : []), [event?.status]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('eventDetails')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.light.tint} />
      ) : !event ? (
        <Text style={styles.muted}>Event not found.</Text>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.row}>
              <Calendar size={16} color={Colors.light.tint} />
              <Text style={styles.value}>{event.date}</Text>
            </View>
            <View style={styles.row}>
              <Clock size={16} color={Colors.light.tint} />
              <Text style={styles.value}>{event.startTime} - {event.endTime}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('attachments')}</Text>
            {attachments.length === 0 ? (
              <Text style={styles.muted}>No attachments</Text>
            ) : (
              attachments.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Paperclip size={16} color={Colors.light.tint} />
                  <Text style={styles.value}>{item.name}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.light.tintDark },
  content: { paddingHorizontal: 16 },
  card: { backgroundColor: Colors.light.cardSecondary, borderRadius: 14, padding: 16, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.light.text, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  value: { color: Colors.light.text, fontWeight: '600', fontSize: 14 },
  sectionTitle: { color: Colors.light.text, fontWeight: '700', fontSize: 16, marginBottom: 10 },
  muted: { color: Colors.light.textSecondary, paddingHorizontal: 16, fontSize: 14 },
});
