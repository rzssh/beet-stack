import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { messageMutations, messageQueries } from "~/utils/api";
import { authClient } from "~/utils/auth";
import { ActionButton } from "~/utils/mobile-ui";

export default function MessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const message = useQuery({
    ...messageQueries.byId(id),
    enabled: !!session.data,
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (message.data) {
      setTitle(message.data.title);
      setContent(message.data.content);
    }
  }, [message.data]);

  const update = useMutation({
    mutationFn: messageMutations.update,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      router.back();
    },
  });
  const remove = useMutation({
    mutationFn: messageMutations.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      router.back();
    },
  });

  if (session.isPending)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  if (!session.data) return <Redirect href="/" />;

  if (message.isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  if (message.error)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{message.error.message}</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.page}>
      <Stack.Screen options={{ title: message.data?.title ?? "Message" }} />
      <Text style={styles.label}>Title</Text>
      <TextInput
        maxLength={100}
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.label}>Content</Text>
      <TextInput
        maxLength={1000}
        multiline
        style={[styles.input, styles.content]}
        value={content}
        onChangeText={setContent}
      />
      {update.error && <Text style={styles.error}>{update.error.message}</Text>}
      {remove.error && <Text style={styles.error}>{remove.error.message}</Text>}
      <ActionButton
        disabled={!title.trim() || !content.trim() || update.isPending}
        label={update.isPending ? "Saving…" : "Save"}
        onPress={() => update.mutate({ id, title, content })}
      />
      <ActionButton
        disabled={remove.isPending}
        label={remove.isPending ? "Deleting…" : "Delete"}
        onPress={() =>
          Alert.alert("Delete message", "Delete this message?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => remove.mutate(id),
            },
          ])
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, gap: 12, padding: 16, backgroundColor: "#f8fafc" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  content: { minHeight: 160, textAlignVertical: "top" },
  error: { color: "#b91c1c" },
});
