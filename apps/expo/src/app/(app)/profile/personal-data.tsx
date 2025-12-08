import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Spinner, Text } from "~/components/ui";
import { FormField, FormInput } from "~/components/forms";
import { useAuth } from "~/lib/hooks";
import { authClient } from "~/utils/auth";
import { toast } from "~/utils/toast";

export default function PersonalDataScreen() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { isAuthenticated } = useAuth();

  const form = useForm({
    defaultValues: {
      name: session?.user?.name ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.updateUser({
          name: value.name,
        });
        queryClient.invalidateQueries({ queryKey: ["session"] });
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error("Failed to update profile");
      }
    },
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-zinc-400">Please sign in to view this page</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4">
          <form.Field name="name">
            {(field) => (
              <FormField field={field} label="Name">
                <FormInput
                  field={field}
                  placeholder="Your name"
                  autoCapitalize="words"
                />
              </FormField>
            )}
          </form.Field>

          <View className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
            <Text className="mb-1 text-zinc-400 text-sm">Email</Text>
            <Text className="text-white">{session?.user?.email}</Text>
            <Text className="mt-2 text-zinc-500 text-xs">
              Email cannot be changed
            </Text>
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
                disabled={!canSubmit || isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <Text>Save Changes</Text>
                )}
              </Button>
            )}
          </form.Subscribe>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
