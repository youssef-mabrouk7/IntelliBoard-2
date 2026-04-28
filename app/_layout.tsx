import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppPreferencesStore } from "@/stores/appPreferencesStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

import { supabase } from "@/utils/supabase";
import { router } from "expo-router";

function RootLayoutNav() {
  const hydrated = useAppPreferencesStore((s) => s.hydrated);
  const onboardingCompleted = useAppPreferencesStore((s) => s.onboardingCompleted);
  const pathname = usePathname();

  // ✅ ALL hooks are declared unconditionally at the top level.
  // The hydration guard is applied inside the JSX return, NOT as an early return
  // before useEffect — an early return there would violate React's rules of hooks
  // and cause "Rendered more hooks than during the previous render".
  useEffect(() => {
    // If preferences haven't loaded from AsyncStorage yet, skip navigation.
    if (!hydrated) return;

    const navigateIfNeeded = (hasSession: boolean) => {
      const onPublicAuth = ["/login", "/register", "/onboarding", "/"].includes(pathname);

      // Authenticated users should only be redirected away from public auth screens.
      // Internal stack screens (task details, settings, profile, create flows) stay accessible.
      if (hasSession && onPublicAuth) {
        router.replace("/(tabs)/home");
        return;
      }

      // Unauthenticated users see onboarding first, then login/register.
      if (!hasSession) {
        if (!onboardingCompleted && pathname !== "/onboarding") {
          router.replace("/onboarding");
          return;
        }
        if (onboardingCompleted && !onPublicAuth) {
          router.replace("/login");
        }
      }
    };

    let isActive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return;
      navigateIfNeeded(Boolean(data.session));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;
      navigateIfNeeded(Boolean(session));
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, [hydrated, pathname, onboardingCompleted]);

  // While preferences are loading from AsyncStorage, render a blank screen.
  // This prevents the WelcomeScreen from being tappable before the onboarding
  // check runs (which was causing onboarding to be skipped after cache clear).
  if (!hydrated) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="create-task" options={{ headerShown: false }} />
      <Stack.Screen name="create-team" options={{ headerShown: false }} />
      <Stack.Screen name="nvite-members" options={{ headerShown: false }} />
      <Stack.Screen name="invite-email" options={{ headerShown: false }} />
      <Stack.Screen name="role-permissions" options={{ headerShown: false }} />
      <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="team/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="new-project" options={{ headerShown: false }} />
      <Stack.Screen name="new-event" options={{ headerShown: false }} />
      <Stack.Screen name="select-due-date" options={{ headerShown: false }} />
      <Stack.Screen name="select-priority" options={{ headerShown: false }} />
      <Stack.Screen name="select-category" options={{ headerShown: false }} />
      <Stack.Screen name="select-subtasks" options={{ headerShown: false }} />
      <Stack.Screen name="select-attachment" options={{ headerShown: false }} />
      <Stack.Screen name="appearance" options={{ headerShown: false }} />
      <Stack.Screen name="language-date" options={{ headerShown: false }} />
      <Stack.Screen name="notifications-settings" options={{ headerShown: false }} />
      <Stack.Screen name="preferences" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen name="help-support" options={{ headerShown: false }} />
      <Stack.Screen name="account" options={{ headerShown: false }} />
      <Stack.Screen name="all-tasks" options={{ headerShown: false }} />
      <Stack.Screen name="all-subtasks" options={{ headerShown: false }} />
      <Stack.Screen name="all-projects" options={{ headerShown: false }} />
      <Stack.Screen name="all-events" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="all-teams" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const hydrate = useAppPreferencesStore((s) => s.hydrate);
  const isRTL = useAppPreferencesStore((s) => s.language === "ar");
  const themeMode = useAppPreferencesStore((s) => s.themeMode);
  const language = useAppPreferencesStore((s) => s.language);

  useEffect(() => {
    hydrate();
    void SplashScreen.hideAsync();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView key={`${themeMode}-${language}`} style={{ flex: 1, direction: isRTL ? "rtl" : "ltr" }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
