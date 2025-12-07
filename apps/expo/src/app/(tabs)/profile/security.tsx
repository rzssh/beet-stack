import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "~/components/ui";
import { useAuth } from "~/lib/hooks";
import { toast } from "~/utils/toast";

interface SecurityOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress?: () => void;
}

const securityOptions: SecurityOption[] = [
  {
    id: "password",
    icon: "key-outline",
    label: "Change Password",
    description: "Update your account password",
    onPress: () => toast.info("Password change coming soon!"),
  },
  {
    id: "2fa",
    icon: "shield-checkmark-outline",
    label: "Two-Factor Authentication",
    description: "Add an extra layer of security",
    onPress: () => toast.info("Two-factor authentication coming soon!"),
  },
  {
    id: "sessions",
    icon: "phone-portrait-outline",
    label: "Active Sessions",
    description: "Manage devices logged into your account",
    onPress: () => toast.info("Session management coming soon!"),
  },
  {
    id: "privacy",
    icon: "eye-off-outline",
    label: "Privacy Settings",
    description: "Control who can see your information",
    onPress: () => toast.info("Privacy settings coming soon!"),
  },
];

export default function SecurityScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-zinc-400">Please sign in to view this page</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View className="overflow-hidden rounded-2xl bg-zinc-800">
          {securityOptions.map((option, index) => (
            <Pressable
              key={option.id}
              onPress={option.onPress}
              className={`flex-row items-center gap-4 px-4 py-4 active:bg-zinc-700 ${
                index < securityOptions.length - 1 ? "border-b border-zinc-700" : ""
              }`}
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                <Ionicons name={option.icon} size={20} color="#a1a1aa" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">{option.label}</Text>
                <Text className="text-zinc-400 text-sm">{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#71717a" />
            </Pressable>
          ))}
        </View>

        <View className="mt-6 rounded-2xl bg-zinc-800/50 p-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="information-circle-outline" size={20} color="#71717a" />
            <Text className="flex-1 text-zinc-400 text-sm">
              Your account security is important to us. Enable two-factor authentication for added protection.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
