import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { friendlyAuthNetworkMessage, supabase } from '@/utils/supabase';

export default function ResetPasswordScreen() {
  const theme = Colors.current;
  const styles = createStyles(theme);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        Alert.alert('Reset failed', error.message);
        return;
      }
      Alert.alert('Success', 'Password updated. Please log in with your new password.');
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Reset failed', friendlyAuthNetworkMessage(e?.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>Enter a new password for your account.</Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          placeholderTextColor={theme.textSecondary}
          style={styles.input}
          secureTextEntry
        />
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm password"
          placeholderTextColor={theme.textSecondary}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, saving && { opacity: 0.7 }]} onPress={handleReset} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
      justifyContent: 'center',
    },
    card: {
      backgroundColor: theme.cardSecondary,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
    },
    subtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    input: {
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      paddingHorizontal: 12,
      color: theme.text,
    },
    button: {
      backgroundColor: theme.tint,
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  });

