import "../styles.css";

import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { LocationProvider } from "~/providers/LocationProvider";
import { queryClient } from "~/utils/api";
import { authClient } from "~/utils/auth";

function useProtectedRoute() {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();

  React.useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isAuthenticated = !!session?.user;

    if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [session, isPending, segments]);
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  useProtectedRoute();

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#c03484" },
          headerTintColor: "#FFFFFF",
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: "Profile",
            presentation: "modal",
          }}
        />
        <Stack.Screen name="taxi" options={{ headerShown: false }} />
      </Stack>
      <StatusBar />
      <PortalHost />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <LocationProvider>
            <RootLayoutNav />
          </LocationProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
