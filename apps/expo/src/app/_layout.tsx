import "../styles.css";

import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useAuth } from "~/lib/hooks";
import { LocationProvider } from "~/providers/LocationProvider";
import { queryClient } from "~/utils/api";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";

  if (!isLoading && isAuthenticated && inAuthGroup) {
    return <Redirect href="/" />;
  }

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
