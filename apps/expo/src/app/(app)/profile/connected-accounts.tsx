import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "~/components/ui";
import { useAuth } from "~/lib/hooks";
import { authClient } from "~/lib/auth";

interface SocialAccount {
  provider: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  connected: boolean;
}

export default function ConnectedAccountsScreen() {
  const { isAuthenticated } = useAuth();
  const { data: session } = authClient.useSession();

  const accounts: SocialAccount[] = [
    {
      provider: "google",
      icon: "logo-google",
      label: "Google",
      connected: false,
    },
    {
      provider: "discord",
      icon: "logo-discord",
      label: "Discord",
      connected: false,
    },
    {
      provider: "apple",
      icon: "logo-apple",
      label: "Apple",
      connected: false,
    },
  ];

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
        <Text className="mb-2 text-zinc-400 text-sm">
          Connect your social accounts for easier sign-in
        </Text>

        {accounts.map((account) => (
          <Pressable
            key={account.provider}
            className="flex-row items-center justify-between rounded-xl bg-zinc-800 p-4 active:bg-zinc-700"
            onPress={() => {}}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                <Ionicons name={account.icon} size={20} color="#a1a1aa" />
              </View>
              <Text className="text-white">{account.label}</Text>
            </View>
            {account.connected ? (
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-green-500" />
                <Text className="text-green-500 text-sm">Connected</Text>
              </View>
            ) : (
              <Text className="text-zinc-500 text-sm">Connect</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
