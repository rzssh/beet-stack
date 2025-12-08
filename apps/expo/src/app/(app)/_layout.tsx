import { Ionicons } from "@expo/vector-icons";
import { Redirect, SplashScreen, Tabs } from "expo-router";
import { useCallback, useEffect } from "react";
import { authClient } from "~/lib/auth";

export default function TabLayout() {
  const { data: authData, isPending } = authClient.useSession();
  // const [isFirstTime] = useIsFirstTime();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!isPending) {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, isPending]);

  // if (isFirstTime) {
  //   return <Redirect href="/onboarding" />;
  // }

  if (!authData?.user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Main",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
          // tabBarBadge: activeRide ? "" : undefined,
          // tabBarBadgeStyle: activeRide
          //   ? { backgroundColor: "#22c55e", minWidth: 8, minHeight: 8 }
          //   : undefined,
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
