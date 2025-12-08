import { useQueryClient } from "@tanstack/react-query";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "~/components/ui";
import { authClient } from "~/lib/auth";
import { useAppForm } from "~/lib/form";
import { useAuth } from "~/lib/hooks";
import { toast } from "~/utils/toast";

export default function PersonalDataScreen() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { isAuthenticated } = useAuth();

  const form = useAppForm({
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
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField
                label="Name"
                placeholder="Your name"
                autoCapitalize="words"
              />
            )}
          />

          <View className="rounded-xl border border-zinc-700 bg-zinc-800 p-4">
            <Text className="mb-1 text-zinc-400 text-sm">Email</Text>
            <Text className="text-white">{session?.user?.email}</Text>
            <Text className="mt-2 text-zinc-500 text-xs">
              Email cannot be changed
            </Text>
          </View>

          <form.AppForm>
            <form.SubmitButton label="Save Changes" className="mt-4" />
          </form.AppForm>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
