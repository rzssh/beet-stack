import { useQuery } from "@tanstack/react-query";
import { Stack, useGlobalSearchParams } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

import { messageQueries } from "~/utils/api";

export default function Message() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data } = useQuery(messageQueries.byId(id!));

  if (!data) return null;

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: data.title }} />
      <View className="h-full w-full p-4">
        <Text className="py-2 font-bold text-3xl text-primary">
          {data.title}
        </Text>
        <Text className="py-4 text-foreground">{data.content}</Text>
      </View>
    </SafeAreaView>
  );
}
