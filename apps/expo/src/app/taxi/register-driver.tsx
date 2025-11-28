import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { driverMutations } from "~/utils/api";

export default function RegisterDriverScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  const createProfileMutation = useMutation({
    ...driverMutations.createProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "profile"] });
      router.back();
    },
  });

  const isValid =
    vehicleMake.trim() &&
    vehicleModel.trim() &&
    vehicleYear.trim().length === 4 &&
    vehicleColor.trim() &&
    licensePlate.trim();

  const handleSubmit = () => {
    if (!isValid) return;

    createProfileMutation.mutate({
      vehicleMake: vehicleMake.trim(),
      vehicleModel: vehicleModel.trim(),
      vehicleYear: vehicleYear.trim(),
      vehicleColor: vehicleColor.trim(),
      licensePlate: licensePlate.trim().toUpperCase(),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: "Register as Driver",
          headerStyle: { backgroundColor: "#18181b" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView className="flex-1 px-4">
        <Text className="mb-6 mt-4 text-center text-2xl font-bold text-white">
          Vehicle Information
        </Text>

        <View className="gap-4">
          <View>
            <Text className="mb-2 text-sm text-zinc-400">Vehicle Make</Text>
            <TextInput
              className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
              placeholder="e.g., Toyota"
              placeholderTextColor="#71717a"
              value={vehicleMake}
              onChangeText={setVehicleMake}
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm text-zinc-400">Vehicle Model</Text>
            <TextInput
              className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
              placeholder="e.g., Camry"
              placeholderTextColor="#71717a"
              value={vehicleModel}
              onChangeText={setVehicleModel}
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm text-zinc-400">Year</Text>
            <TextInput
              className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
              placeholder="e.g., 2023"
              placeholderTextColor="#71717a"
              value={vehicleYear}
              onChangeText={setVehicleYear}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>

          <View>
            <Text className="mb-2 text-sm text-zinc-400">Color</Text>
            <TextInput
              className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
              placeholder="e.g., Silver"
              placeholderTextColor="#71717a"
              value={vehicleColor}
              onChangeText={setVehicleColor}
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="mb-2 text-sm text-zinc-400">License Plate</Text>
            <TextInput
              className="rounded-lg bg-zinc-800 px-4 py-3 text-white"
              placeholder="e.g., ABC-1234"
              placeholderTextColor="#71717a"
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
            />
          </View>

          {createProfileMutation.error && (
            <View className="rounded-lg bg-red-500/20 p-3">
              <Text className="text-center text-red-400">
                {createProfileMutation.error.message}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || createProfileMutation.isPending}
            className={`mt-4 rounded-lg py-4 ${isValid ? "bg-primary" : "bg-zinc-700"}`}
          >
            <Text className="text-center font-semibold text-white">
              {createProfileMutation.isPending ? "Registering..." : "Register Vehicle"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
