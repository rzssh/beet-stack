import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "~/utils/api";

export default function CounterTest() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: countData,
    isLoading: isCountLoading,
    error: countError,
  } = useQuery({
    queryKey: ["count"],
    queryFn: () => api.count.get(),
    refetchInterval: false,
  });

  const incrementMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      try {
        return await api.count.post();
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["count"] });
    },
  });

  const handleIncrement = () => {
    incrementMutation.mutate();
  };

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Counter Test" }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="pb-4 text-center font-bold text-4xl text-foreground">
          Counter Test
        </Text>

        <Text className="pb-2 text-center text-foreground text-lg">
          Testing Eden Treaty + Elysia Backend Integration
        </Text>

        <View className="mt-8 items-center">
          {isCountLoading ? (
            <Text className="text-2xl text-foreground">Loading...</Text>
          ) : countError ? (
            <View className="items-center">
              <Text className="mb-2 text-destructive text-lg">
                Error loading count
              </Text>
              <Text className="text-muted-foreground text-sm">
                {countError instanceof Error
                  ? countError.message
                  : "Unknown error"}
              </Text>
            </View>
          ) : (
            <Text className="mb-8 font-bold text-6xl text-primary">
              {countData?.data?.count ?? "?"}
            </Text>
          )}

          <Pressable
            onPress={handleIncrement}
            disabled={isLoading || incrementMutation.isPending}
            className={`${
              isLoading || incrementMutation.isPending
                ? "bg-muted"
                : "bg-primary"
            } min-w-32 items-center rounded-lg px-8 py-4`}
          >
            <Text
              className={`${
                isLoading || incrementMutation.isPending
                  ? "text-muted-foreground"
                  : "text-primary-foreground"
              } font-semibold text-lg`}
            >
              {isLoading || incrementMutation.isPending ? "..." : "Increment"}
            </Text>
          </Pressable>

          {incrementMutation.isError && (
            <Text className="mt-4 text-center text-destructive">
              Error:{" "}
              {incrementMutation.error instanceof Error
                ? incrementMutation.error.message
                : "Failed to increment"}
            </Text>
          )}
        </View>

        <View className="mt-8">
          <Text className="text-center text-muted-foreground text-sm">
            This counter is stored on the Elysia backend server
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
