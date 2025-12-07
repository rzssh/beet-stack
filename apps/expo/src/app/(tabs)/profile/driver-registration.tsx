import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, ErrorCard, Spinner, Text } from "~/components/ui";
import { FormField, FormInput } from "~/components/forms";
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

  const form = useForm({
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
          <form.Field name="vehicleMake">
            {(field) => (
              <FormField field={field} label="Vehicle Make">
                <FormInput
                  field={field}
                  placeholder="e.g., Toyota"
                  autoCapitalize="words"
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="vehicleModel">
            {(field) => (
              <FormField field={field} label="Vehicle Model">
                <FormInput
                  field={field}
                  placeholder="e.g., Camry"
                  autoCapitalize="words"
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="vehicleYear">
            {(field) => (
              <FormField field={field} label="Vehicle Year">
                <FormInput
                  field={field}
                  placeholder="e.g., 2022"
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="vehicleColor">
            {(field) => (
              <FormField field={field} label="Vehicle Color">
                <FormInput
                  field={field}
                  placeholder="e.g., Black"
                  autoCapitalize="words"
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="licensePlate">
            {(field) => (
              <FormField field={field} label="License Plate">
                <FormInput
                  field={field}
                  placeholder="e.g., ABC 1234"
                  autoCapitalize="characters"
                />
              </FormField>
            )}
          </form.Field>
        </View>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              onPress={() => form.handleSubmit()}
              disabled={!canSubmit || isSubmitting || createProfileMutation.isPending}
              className="mt-4"
            >
              {isSubmitting || createProfileMutation.isPending ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text>Register as Driver</Text>
              )}
            </Button>
          )}
        </form.Subscribe>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
