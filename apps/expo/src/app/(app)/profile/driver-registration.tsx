import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorCard, Text } from "~/components/ui";
import { useAppForm } from "~/lib/form";
import { useAuth } from "~/lib/hooks";
import { driverMutations } from "~/utils/api";
import { toast } from "~/utils/toast";

export default function DriverRegistrationScreen() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const createProfileMutation = useMutation({
    ...driverMutations.createProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver"] });
      toast.success("Driver profile created successfully");
      router.back();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const form = useAppForm({
    defaultValues: {
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColor: "",
      licensePlate: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      createProfileMutation.mutate(value);
    },
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-zinc-400">Please sign in to register as a driver</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text className="font-semibold text-white text-lg">
            Vehicle Information
          </Text>
          <Text className="text-zinc-400 text-sm">
            Enter your vehicle details to start driving
          </Text>
        </View>

        {error && <ErrorCard message={error} />}

        <View className="gap-4">
          <form.AppField
            name="vehicleMake"
            children={(field) => (
              <field.TextField
                label="Vehicle Make"
                placeholder="e.g., Toyota"
                autoCapitalize="words"
              />
            )}
          />

          <form.AppField
            name="vehicleModel"
            children={(field) => (
              <field.TextField
                label="Vehicle Model"
                placeholder="e.g., Camry"
                autoCapitalize="words"
              />
            )}
          />

          <form.AppField
            name="vehicleYear"
            children={(field) => (
              <field.TextField
                label="Vehicle Year"
                placeholder="e.g., 2022"
                keyboardType="number-pad"
                maxLength={4}
              />
            )}
          />

          <form.AppField
            name="vehicleColor"
            children={(field) => (
              <field.TextField
                label="Vehicle Color"
                placeholder="e.g., Black"
                autoCapitalize="words"
              />
            )}
          />

          <form.AppField
            name="licensePlate"
            children={(field) => (
              <field.TextField
                label="License Plate"
                placeholder="e.g., ABC 1234"
                autoCapitalize="characters"
              />
            )}
          />
        </View>

        <form.AppForm>
          <form.SubmitButton
            label="Register as Driver"
            disabled={createProfileMutation.isPending}
            className="mt-4"
          />
        </form.AppForm>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
