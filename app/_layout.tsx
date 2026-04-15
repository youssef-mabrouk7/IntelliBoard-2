import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
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

  useEffect(() => {
    if (!hydrated) return;

    const resolveTargetPath = (hasSession: boolean) => {
      if (hasSession) return "/(tabs)/home";
      return onboardingCompleted ? "/login" : "/onboarding";
    };

    const navigateIfNeeded = (hasSession: boolean) => {
      const target = resolveTargetPath(hasSession);
      const onTabs = pathname.startsWith("/(tabs)") || ["/home", "/tasks", "/teams", "/calendar", "/analytics", "/projects"].includes(pathname);
      const onPublicAuth = ["/login", "/register", "/onboarding", "/"].includes(pathname);

      // Only redirect when user is in the wrong route group.
      if (hasSession && !onTabs) router.replace("/(tabs)/home");
      if (!hasSession && !onPublicAuth) router.replace(target);
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
  }, [hydrated, onboardingCompleted]);

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

    </Stack>
  );
}

export default function RootLayout() {
  const hydrate = useAppPreferencesStore((s) => s.hydrate);
  const isRTL = useAppPreferencesStore((s) => s.language === "ar");

  useEffect(() => {
    hydrate();
    void SplashScreen.hideAsync();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, direction: isRTL ? "rtl" : "ltr" }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
