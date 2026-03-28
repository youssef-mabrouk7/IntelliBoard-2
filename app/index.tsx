import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#1E3A5F', '#4A7C9B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.tagline}>Manage your projects{'\n'}in a smartest way</Text>
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <View style={styles.lightbulb}>
                <View style={styles.bulbTop} />
                <View style={styles.bulbBottom} />
                <View style={styles.rays}>
                  <View style={[styles.ray, styles.rayTop]} />
                  <View style={[styles.ray, styles.rayTopLeft]} />
                  <View style={[styles.ray, styles.rayTopRight]} />
                  <View style={[styles.ray, styles.rayLeft]} />
                  <View style={[styles.ray, styles.rayRight]} />
                </View>
                <View style={styles.chain}>
                  <View style={styles.chainLink} />
                  <View style={styles.chainLink} />
                  <View style={styles.chainLink} />
                </View>
              </View>
            </View>
            <Text style={styles.logoText}>IntelliBoard</Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Lets start!</Text>
            <View style={styles.arrowCircle}>
              <ArrowRight size={20} color="#1A1A1A" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lightbulb: {
    width: 60,
    height: 80,
    alignItems: 'center',
  },
  bulbTop: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
  },
  bulbBottom: {
    width: 24,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginTop: -2,
  },
  rays: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ray: {
    position: 'absolute',
    width: 3,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  rayTop: {
    top: -8,
    left: '50%',
    marginLeft: -1.5,
  },
  rayTopLeft: {
    top: 5,
    left: -6,
    transform: [{ rotate: '-45deg' }],
  },
  rayTopRight: {
    top: 5,
    right: -6,
    transform: [{ rotate: '45deg' }],
  },
  rayLeft: {
    top: 20,
    left: -10,
    transform: [{ rotate: '-90deg' }],
  },
  rayRight: {
    top: 20,
    right: -10,
    transform: [{ rotate: '90deg' }],
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
    borderColor: '#4A7C9B',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#B8B8B8',
    borderRadius: 30,
    paddingLeft: 24,
    paddingRight: 6,
    paddingVertical: 6,
    height: 56,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
