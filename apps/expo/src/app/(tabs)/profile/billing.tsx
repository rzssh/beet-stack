import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text } from "~/components/ui";
import { useAuth } from "~/lib/hooks";

export default function BillingScreen() {
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
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
            <Ionicons name="card-outline" size={40} color="#71717a" />
          </View>
          <View className="items-center gap-2">
            <Text className="font-semibold text-white text-lg">
              No payment methods
            </Text>
            <Text className="text-center text-zinc-400">
              Add a payment method to book rides
            </Text>
          </View>
        </View>

        <Button
          variant="outline"
          className="border-dashed border-zinc-600"
          onPress={() => {}}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="add" size={20} color="#a1a1aa" />
            <Text className="text-zinc-400">Add Payment Method</Text>
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
