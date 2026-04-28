import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Flag, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTaskMetaDraftStore } from '@/stores/taskMetaDraftStore';

type Priority = 'low' | 'medium' | 'high';

interface PriorityOption {
  value: Priority;
  label: string;
  description: string;
}

const priorities: PriorityOption[] = [
  {
    value: 'low',
    label: 'Low Priority',
    description: 'Can be completed when time permits',
  },
  {
    value: 'medium',
    label: 'Medium Priority',
    description: 'Should be completed soon',
  },
  {
    value: 'high',
    label: 'High Priority',
    description: 'Requires immediate attention',
  },
];

export default function SelectPriorityScreen() {
<<<<<<< HEAD
  const draftPriority = useTaskMetaDraftStore((s) => s.priority);
  const setDraftPriority = useTaskMetaDraftStore((s) => s.setPriority);
  const [selectedPriority, setSelectedPriority] = useState<Priority>(
    draftPriority ? draftPriority.toLowerCase() as Priority : 'high',
  );
=======
  const theme = Colors.current;
  const styles = createStyles(theme);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('high');
>>>>>>> 8b4db185ebe6d2c512e2adbc69b0152d131c73ab

  const handleSave = () => {
    const value = selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1) as 'High' | 'Medium' | 'Low';
    setDraftPriority(value);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Priority</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Priority Level</Text>
        
        <View style={styles.optionsList}>
          {priorities.map((priority) => {
            const priorityColor = theme.priority[priority.value];
            return (
            <TouchableOpacity
              key={priority.value}
              style={[
                styles.priorityCard,
                selectedPriority === priority.value && styles.priorityCardSelected,
                { borderColor: priorityColor },
              ]}
              onPress={() => setSelectedPriority(priority.value)}
            >
              <View style={styles.priorityLeft}>
                <View style={[styles.priorityIcon, { backgroundColor: priorityColor + '20' }]}>
                  <Flag size={20} color={priorityColor} />
                </View>
                <View>
                  <Text style={styles.priorityLabel}>{priority.label}</Text>
                  <Text style={styles.priorityDescription}>{priority.description}</Text>
                </View>
              </View>
              
              <View
                style={[
                  styles.radioButton,
                  selectedPriority === priority.value && { backgroundColor: priorityColor, borderColor: priorityColor },
                ]}
              >
                {selectedPriority === priority.value && (
                  <Check size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
  saveButton: {
    backgroundColor: theme.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.border,
  },
  priorityCardSelected: {
    backgroundColor: theme.cardSecondary,
  },
  priorityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  priorityDescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
