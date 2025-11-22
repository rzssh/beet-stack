import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "~/utils/api";

export default function CounterTest() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Query for getting count
  const {
    data: countData,
    isLoading: isCountLoading,
    error: countError,
  } = useQuery({
    queryKey: ["count"],
    queryFn: async () => {
      try {
        const response = await api.count.get();
        console.log("Count response:", response);
        return response;
      } catch (error) {
        console.error("Count query error:", error);
        throw error;
      }
    },
    refetchInterval: false,
  });

  // Mutation for incrementing count
  const incrementMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      try {
        const response = await api.count.increment.post();
        console.log("Increment response:", response);
        return response;
      } catch (error) {
        console.error("Increment mutation error:", error);
        throw error;
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
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Counter Test" }} />
      <View className="bg-background h-full w-full p-4">
        <Text className="text-foreground pb-4 text-center text-4xl font-bold">
          Counter Test
        </Text>
        
        <Text className="text-foreground pb-2 text-center text-lg">
          Testing Eden Treaty + Elysia Backend Integration
        </Text>

        <View className="mt-8 items-center">
          {isCountLoading ? (
            <Text className="text-foreground text-2xl">Loading...</Text>
          ) : countError ? (
            <View className="items-center">
              <Text className="text-destructive text-lg mb-2">Error loading count</Text>
              <Text className="text-muted-foreground text-sm">
                {countError instanceof Error ? countError.message : "Unknown error"}
              </Text>
            </View>
          ) : (
            <Text className="text-primary text-6xl font-bold mb-8">
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
            } rounded-lg px-8 py-4 min-w-32 items-center`}
          >
            <Text
              className={`${
                isLoading || incrementMutation.isPending
                  ? "text-muted-foreground"
                  : "text-primary-foreground"
              } text-lg font-semibold`}
            >
              {isLoading || incrementMutation.isPending ? "..." : "Increment"}
            </Text>
          </Pressable>

          {incrementMutation.isError && (
            <Text className="text-destructive mt-4 text-center">
              Error: {incrementMutation.error instanceof Error 
                ? incrementMutation.error.message 
                : "Failed to increment"}
            </Text>
          )}
        </View>

        <View className="mt-8">
          <Text className="text-muted-foreground text-center text-sm">
            This counter is stored on the Elysia backend server
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}