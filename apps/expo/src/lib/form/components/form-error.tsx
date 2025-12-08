import { View } from "react-native";

import { Text } from "~/components/ui/text";

import { useFormContext } from "../context";

export function FormError() {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
      {(submitError) =>
        submitError ? (
          <View className="rounded-lg bg-destructive/10 p-3">
            <Text className="text-destructive text-sm">{String(submitError)}</Text>
          </View>
        ) : null
      }
    </form.Subscribe>
  );
}
