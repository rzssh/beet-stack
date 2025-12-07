import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useActiveRide } from "~/hooks/useActiveRide";

export default function TabLayout() {
  const { data: activeRide } = useActiveRide();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#18181b",
          borderTopColor: "#27272a",
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: "#c03484",
        tabBarInactiveTintColor: "#71717a",
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Main",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
          tabBarBadge: activeRide ? "" : undefined,
          tabBarBadgeStyle: activeRide
            ? { backgroundColor: "#22c55e", minWidth: 8, minHeight: 8 }
            : undefined,
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
