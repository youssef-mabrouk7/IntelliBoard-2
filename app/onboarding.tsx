import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useLocalization } from '@/utils/localization';
import { useAppPreferencesStore } from '@/stores/appPreferencesStore';

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { t, isRTL } = useLocalization();
  const setOnboardingCompleted = useAppPreferencesStore((s) => s.setOnboardingCompleted);
  const slideCount = 3;

  const slides = useMemo(
    () => [
      { title: t('onboardingTitle1'), body: t('onboardingText1') },
      { title: t('onboardingTitle2'), body: t('onboardingText2') },
      {
        title: 'Track progress with confidence',
        body: 'Create teams, organize projects by company, and update tasks and subtasks in one place.',
      },
    ],
    [t],
  );

  const finish = async () => {
    await setOnboardingCompleted(true);
    router.replace('/login');
  };

  return (
    <LinearGradient colors={['#1E3A5F', '#4A7C9B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={finish}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.center}>
            <Text style={styles.stepText}>{`Step ${step + 1} of ${slideCount}`}</Text>
            <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{slides[step]?.title}</Text>
            <Text style={[styles.body, { textAlign: isRTL ? 'right' : 'left' }]}>{slides[step].body}</Text>
          </View>

          <View style={styles.bottom}>
            <View style={styles.dots}>
              {slides.map((_, idx) => (
                <View key={idx} style={[styles.dot, idx === step && styles.dotActive]} />
              ))}
            </View>
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, step === 0 && styles.secondaryButtonDisabled]}
                onPress={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <Text style={[styles.secondaryButtonText, step === 0 && styles.secondaryButtonTextDisabled]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => (step === slides.length - 1 ? finish() : setStep((s) => s + 1))}
              >
                <Text style={styles.buttonText}>{step === slides.length - 1 ? t('getStarted') : t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 24 },
  topRow: { alignItems: 'flex-end', paddingTop: 8 },
  skipText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  center: { gap: 14, minHeight: Dimensions.get('window').height * 0.35, justifyContent: 'center' },
  stepText: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '700' },
  title: { fontSize: 30, lineHeight: 38, color: '#FFFFFF', fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 27, color: 'rgba(255,255,255,0.92)', fontWeight: '500' },
  bottom: { gap: 20 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 28, backgroundColor: '#FFFFFF' },
  buttonsRow: { flexDirection: 'row', gap: 10 },
  button: { backgroundColor: '#FFFFFF', borderRadius: 28, height: 56, alignItems: 'center', justifyContent: 'center', flex: 1 },
  buttonText: { color: '#1E3A5F', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButtonTextDisabled: { color: 'rgba(255,255,255,0.8)' },
});
