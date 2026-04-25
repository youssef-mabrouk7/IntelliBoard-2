import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Folder, Users, Briefcase, Calendar, BarChart3 } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useLocalization } from '@/utils/localization';

export default function TabLayout() {
  const { t } = useLocalization();
  const theme = Colors.current;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('tasks'),
          tabBarIcon: ({ color }) => <Folder size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: t('teams'),
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
          href: '/all-events',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('calendar'),
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('analytics'),
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: t('projects'),
          tabBarIcon: ({ color }) => <Briefcase size={22} color={color} />,
          href: '/projects',
        }}
      />
    </Tabs>
  );
}
