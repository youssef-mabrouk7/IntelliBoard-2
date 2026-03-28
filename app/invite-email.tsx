import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, X, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { users } from '@/constants/mockData';

export default function InviteEmailScreen() {
  const [emails, setEmails] = useState(['John@example.com', 'sarah@example.com', 'alice@example.com']);
  const [role] = useState('Member');
  const [message, setMessage] = useState('');
  const suggestedUsers = users.slice(0, 3);

  const removeEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleSend = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Via Email</Text>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.emailsSection}>
          <View style={styles.emailsContainer}>
            {emails.map((email, index) => (
              <View key={index} style={styles.emailChip}>
                <Text style={styles.emailChipText}>{email}</Text>
                <TouchableOpacity onPress={() => removeEmail(email)}>
                  <X size={14} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.optionRow}>
            <Text style={styles.optionLabel}>Role</Text>
            <View style={styles.optionRight}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{role}</Text>
              </View>
              <ChevronRight size={18} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>

          <View style={styles.messageSection}>
            <Text style={styles.messageLabel}>Message (Optional)</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Write a message..."
              placeholderTextColor={Colors.light.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Shield size={20} color={Colors.light.tint} />
          </View>
          <Text style={styles.infoText}>
            Invite emails will contain a unique link for access to Project Manager
          </Text>
        </View>

        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedTitle}>You may also want to invite:</Text>
          <View style={styles.suggestedList}>
            {suggestedUsers.map((user) => (
              <View key={user.id} style={styles.suggestedRow}>
                <Image source={{ uri: user.avatar }} style={styles.suggestedAvatar} />
                <View style={styles.suggestedInfo}>
                  <Text style={styles.suggestedName}>{user.name}</Text>
                  <Text style={styles.suggestedEmail}>{user.email}</Text>
                </View>
                <TouchableOpacity style={styles.removeButton}>
                  <X size={18} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
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
  sendButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emailsSection: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  emailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  emailChipText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  section: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageSection: {
    marginTop: 16,
  },
  messageLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 12,
  },
  messageInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  suggestedSection: {
    backgroundColor: Colors.light.cardSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 30,
    padding: 16,
  },
  suggestedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  suggestedList: {
    gap: 12,
  },
  suggestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  suggestedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  suggestedEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
