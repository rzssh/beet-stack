import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { LocationProvider } from "~/providers/LocationProvider";
import { queryClient } from "~/utils/api";

import "../styles.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <LocationProvider>
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
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
          </LocationProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
