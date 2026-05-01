import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Building2, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { friendlyAuthNetworkMessage, isSupabaseConfigured, supabase } from '@/utils/supabase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyOptions, setCompanyOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [role, setRole] = useState<'Project Manager' | 'Team Leader' | 'Team Member'>('Team Member');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const theme = Colors.current;
  const styles = createStyles(theme);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setCompaniesLoading(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error loading companies:', error);
          setCompaniesError(error.message || 'Unable to load companies');
          setCompanyOptions([]);
          return;
        }

        const companies = (data || [])
          .map((item: any) => ({ id: String(item?.id || ''), name: String(item?.name || '').trim() }))
          .filter((item) => item.id.length > 0 && item.name.length > 0);
        setCompanyOptions(companies);
        setCompaniesError(null);
      } finally {
        setCompaniesLoading(false);
      }
    };

    void loadCompanies();
  }, []);

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
    if (!email || !password || !name || !companyName || !companyId) {
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
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company_name: companyName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (user) {
        const baseProfile = {
          id: user.id,
          name,
          email,
          role,
          company_id: companyId,
        } as Record<string, any>;

        const attemptInsertProfile = async (payload: Record<string, any>) =>
          supabase.from('user').insert([payload]);

        let { error: profileError } = await attemptInsertProfile({
          ...baseProfile,
          company_name: companyName,
        });

        // Backward compatibility for DBs that still use `company`.
        if (profileError && String(profileError.message || '').includes("Could not find the 'company_name' column")) {
          const retry = await attemptInsertProfile({
            ...baseProfile,
            company: companyName,
          });
          profileError = retry.error;
        }

        // Last fallback for DBs without company columns yet.
        if (
          profileError &&
          (String(profileError.message || '').includes("Could not find the 'company' column") ||
            String(profileError.message || '').includes("Could not find the 'company_name' column"))
        ) {
          const retry = await attemptInsertProfile(baseProfile);
          profileError = retry.error;
        }

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      alert('Registration successful! Please check your email for verification if needed.');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      const msg = error?.message as string | undefined;
      if ((msg ?? '').toLowerCase().includes('network request failed')) {
        alert(friendlyAuthNetworkMessage(msg));
      } else {
        alert(getFriendlySignUpError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
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
                <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Name" placeholderTextColor={theme.textSecondary} value={name} onChangeText={setName} />
              </View>

              <View style={styles.inputWrapper}>
                <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff size={20} color={theme.textSecondary} /> : <Eye size={20} color={theme.textSecondary} />}
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re Password"
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  {showConfirmPassword ? <EyeOff size={20} color={theme.textSecondary} /> : <Eye size={20} color={theme.textSecondary} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.inputWrapper} onPress={() => setCompanyModalVisible(true)}>
                <Building2 size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <Text style={[styles.selectText, !companyName && styles.selectPlaceholder]}>{companyName || 'Company Name'}</Text>
                <ChevronDown size={18} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.inputWrapper} onPress={() => setRoleModalVisible(true)}>
                <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <Text style={styles.selectText}>{role}</Text>
                <ChevronDown size={18} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.registerButton, loading && styles.disabledButton]} onPress={handleRegister} disabled={loading}>
                <Text style={styles.registerButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already Have Account ? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={companyModalVisible} transparent animationType="fade" onRequestClose={() => setCompanyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Company Name</Text>
            {companiesLoading ? (
              <Text style={styles.modalItemText}>Loading companies...</Text>
            ) : companiesError ? (
              <Text style={styles.modalErrorText}>{companiesError}</Text>
            ) : companyOptions.length === 0 ? (
              <Text style={styles.modalItemText}>No companies found in database.</Text>
            ) : (
              companyOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.modalItem, companyName === option.name && styles.modalItemSelected]}
                  onPress={() => {
                    setCompanyName(option.name);
                    setCompanyId(option.id);
                    setCompanyModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, companyName === option.name && styles.modalItemTextSelected]}>{option.name}</Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setCompanyModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={roleModalVisible} transparent animationType="fade" onRequestClose={() => setRoleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Role</Text>
            {(['Project Manager', 'Team Leader', 'Team Member'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.modalItem, role === option && styles.modalItemSelected]}
                onPress={() => {
                  setRole(option);
                  setRoleModalVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, role === option && styles.modalItemTextSelected]}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setRoleModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
      backgroundColor: theme.tintDark,
    },
    bulbBottom: {
      width: 24,
      height: 16,
      backgroundColor: theme.tintDark,
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
      borderColor: theme.tint,
    },
    logoText: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.tintDark,
    },
    inputContainer: {
      gap: 16,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      height: 56,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    eyeIcon: {
      padding: 4,
    },
    selectText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    selectPlaceholder: {
      color: theme.textSecondary,
    },
    registerButton: {
      backgroundColor: theme.tintDark,
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
      color: theme.textSecondary,
    },
    loginLink: {
      fontSize: 14,
      color: theme.tint,
      fontWeight: '600',
      fontStyle: 'italic',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 6,
    },
    modalItem: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: theme.cardSecondary,
    },
    modalItemSelected: {
      borderColor: theme.tint,
      backgroundColor: `${theme.tint}1F`,
    },
    modalItemText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    modalItemTextSelected: {
      color: theme.tint,
    },
    modalErrorText: {
      color: theme.error,
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
    },
    modalClose: {
      alignSelf: 'flex-end',
      marginTop: 4,
    },
    modalCloseText: {
      color: theme.tint,
      fontWeight: '700',
      fontSize: 14,
    },
  });
