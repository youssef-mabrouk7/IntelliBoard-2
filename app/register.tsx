import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { friendlyAuthNetworkMessage, isSupabaseConfigured, supabase } from '@/utils/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const getFriendlySignUpError = (error: { message?: string; code?: string } | null) => {
    const message = (error?.message || '').toLowerCase();
    const code = (error?.code || '').toLowerCase();

    if (
      message.includes('email rate limit exceeded') ||
      message.includes('over_email_send_rate_limit') ||
      code.includes('over_email_send_rate_limit')
    ) {
      return 'Too many signup emails were sent recently. Please wait 1-2 minutes and try again.';
    }

    if (message.includes('already registered') || message.includes('user already registered')) {
      return 'This email is already registered. Please log in instead.';
    }

    return error?.message || 'Registration failed. Please try again.';
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      alert('Please fill all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!isSupabaseConfigured) {
      alert(
        'Supabase is not configured in this build. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in Expo environment variables for your build profile, then rebuild the APK.',
      );
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (user) {
        // Create public profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              name: name,
              email: email,
            }
          ]);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't block the user if only the profile creation fails, they can fix it later
        }
      }

      alert('Registration successful! Please check your email for verification if needed.');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      const msg = error?.message as string | undefined
      if ((msg ?? '').toLowerCase().includes('network request failed')) {
        alert(friendlyAuthNetworkMessage(msg))
      } else {
        alert(getFriendlySignUpError(error))
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.lightbulb}>
                <View style={styles.bulbTop} />
                <View style={styles.bulbBottom} />
                <View style={styles.chain}>
                  <View style={styles.chainLink} />
                  <View style={styles.chainLink} />
                  <View style={styles.chainLink} />
                </View>
              </View>
              <Text style={styles.logoText}>IntelliBoard</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.light.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.light.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re Password"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.light.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.light.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, loading && styles.disabledButton]} 
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already Have Account ? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.languageContainer}>
                <TouchableOpacity style={styles.languageButton}>
                  <Text style={styles.languageText}>🇺🇸</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.languageButton}>
                  <Text style={styles.languageText}>🇪🇬</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    padding: 16,
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lightbulb: {
    width: 60,
    height: 80,
    alignItems: 'center',
    marginBottom: 12,
  },
  bulbTop: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.tintDark,
  },
  bulbBottom: {
    width: 24,
    height: 16,
    backgroundColor: Colors.light.tintDark,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: -2,
  },
  chain: {
    position: 'absolute',
    top: 12,
    flexDirection: 'column',
    gap: 4,
  },
  chainLink: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.tintDark,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: Colors.light.tintDark,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  languageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 20,
  },
});
