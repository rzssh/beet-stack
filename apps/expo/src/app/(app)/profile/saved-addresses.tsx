import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text } from "~/components/ui";
import { useAuth } from "~/lib/hooks";
import { toast } from "~/utils/toast";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  icon: string;
}

export default function SavedAddressesScreen() {
  const { isAuthenticated } = useAuth();
  const [addresses] = React.useState<SavedAddress[]>([]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-zinc-400">Please sign in to view this page</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
      >
        {addresses.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-4">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
              <Ionicons name="location-outline" size={40} color="#71717a" />
            </View>
            <View className="items-center gap-2">
              <Text className="font-semibold text-white text-lg">
                No saved addresses
              </Text>
              <Text className="text-center text-zinc-400">
                Save your frequently used addresses for quick access
              </Text>
            </View>
          </View>
        ) : (
          addresses.map((addr) => (
            <Pressable
              key={addr.id}
              className="flex-row items-center gap-3 rounded-xl bg-zinc-800 p-4 active:bg-zinc-700"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                <Ionicons
                  name={addr.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color="#a1a1aa"
                />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-white">{addr.label}</Text>
                <Text className="text-zinc-400 text-sm" numberOfLines={1}>
                  {addr.address}
                </Text>
              </View>
              <Ionicons name="pencil-outline" size={20} color="#71717a" />
            </Pressable>
          ))
        )}

        <Button
          variant="outline"
          className="mt-4 border-dashed border-zinc-600"
          onPress={() => toast.info("Feature coming soon!")}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="add" size={20} color="#a1a1aa" />
            <Text className="text-zinc-400">Add New Address</Text>
          </View>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
