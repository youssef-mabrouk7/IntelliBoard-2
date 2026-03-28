import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import {
  Home,
  Folder,
  Calendar,
  BarChart3,
  Users,
  Settings,
  User,
  X,
  Briefcase,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface SideDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function SideDrawer({ isVisible, onClose }: SideDrawerProps) {
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, fadeAnim]);

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as never);
    }, 200);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Animated.View
            style={[
              styles.backdropFade,
              { opacity: fadeAnim },
            ]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuContainer}>
            <MenuItem
              icon={<Home size={22} color={Colors.light.tint} />}
              label="Home"
              onPress={() => handleNavigation('/(tabs)/home')}
            />
            <MenuItem
              icon={<Folder size={22} color={Colors.light.tint} />}
              label="Tasks"
              onPress={() => handleNavigation('/(tabs)/tasks')}
            />
            <MenuItem
              icon={<Briefcase size={22} color={Colors.light.tint} />}
              label="Projects"
              onPress={() => handleNavigation('/(tabs)/projects')}
            />
            <MenuItem
              icon={<Users size={22} color={Colors.light.tint} />}
              label="Teams"
              onPress={() => handleNavigation('/(tabs)/teams')}
            />

            <View style={styles.divider} />

            <MenuItem
              icon={<Calendar size={22} color={Colors.light.tint} />}
              label="Calendar"
              onPress={() => handleNavigation('/(tabs)/calendar')}
            />
            <MenuItem
              icon={<BarChart3 size={22} color={Colors.light.tint} />}
              label="Analytics"
              onPress={() => handleNavigation('/(tabs)/analytics')}
            />

            <View style={styles.divider} />

            <MenuItem
              icon={<User size={22} color={Colors.light.tint} />}
              label="Profile"
              onPress={() => handleNavigation('/profile')}
            />
            <MenuItem
              icon={<Settings size={22} color={Colors.light.tint} />}
              label="Settings"
              onPress={() => handleNavigation('/settings')}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: Colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  menuContainer: {
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 16,
    marginHorizontal: 20,
  },
});
