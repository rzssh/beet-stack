import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { messageMutations, messageQueries } from "~/utils/api";
import { authClient } from "~/utils/auth";
import { ActionButton } from "~/utils/mobile-ui";

export default function Index() {
  const session = authClient.useSession();

  if (session.isPending) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }
  if (!session.data) return <AuthForm />;
  return <Messages email={session.data.user.email} />;
}

function AuthForm() {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    setError(undefined);
    const response = signup
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (response.error) setError(response.error.message);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.authCard}>
        <Stack.Screen
          options={{ title: signup ? "Create account" : "Sign in" }}
        />
        <Text style={styles.heading}>
          {signup ? "Create account" : "Sign in"}
        </Text>
        {signup && (
          <TextInput
            accessibilityLabel="Name"
            autoComplete="name"
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          accessibilityLabel="Password"
          autoComplete={signup ? "new-password" : "current-password"}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <ActionButton
          disabled={pending}
          label={pending ? "Working…" : signup ? "Create account" : "Sign in"}
          onPress={submit}
        />
        <Pressable onPress={() => setSignup((value) => !value)}>
          <Text style={styles.link}>
            {signup
              ? "Already registered? Sign in"
              : "Need an account? Sign up"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Messages({ email }: { email: string }) {
  const queryClient = useQueryClient();
  const messages = useQuery(messageQueries.all());
  const create = useMutation({
    mutationFn: messageMutations.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
  });
  const remove = useMutation({
    mutationFn: messageMutations.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submit = async () => {
    await create.mutateAsync({ title, content });
    setTitle("");
    setContent("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: "Your messages" }} />
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Messages</Text>
            <Text>{email}</Text>
          </View>
          <ActionButton
            label="Sign out"
            onPress={async () => {
              await authClient.signOut();
              queryClient.clear();
            }}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.subheading}>Create message</Text>
          <TextInput
            accessibilityLabel="Title"
            maxLength={100}
            placeholder="Title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            accessibilityLabel="Content"
            maxLength={1000}
            multiline
            placeholder="Content"
            style={[styles.input, styles.multiline]}
            value={content}
            onChangeText={setContent}
          />
          {create.error && (
            <Text style={styles.error}>{create.error.message}</Text>
          )}
          <ActionButton
            disabled={!title.trim() || !content.trim() || create.isPending}
            label={create.isPending ? "Creating…" : "Create"}
            onPress={submit}
          />
        </View>
        {messages.isLoading && <ActivityIndicator />}
        {messages.error && (
          <Text style={styles.error}>{messages.error.message}</Text>
        )}
        {messages.data?.map((message) => (
          <View key={message.id} style={styles.card}>
            <Link
              href={{ pathname: "/message/[id]", params: { id: message.id } }}
              asChild
            >
              <Pressable>
                <Text style={styles.subheading}>{message.title}</Text>
                <Text>{message.content}</Text>
                <Text style={styles.link}>Open and edit</Text>
              </Pressable>
            </Link>
            <ActionButton
              disabled={remove.isPending}
              label="Delete"
              onPress={() => remove.mutate(message.id)}
            />
          </View>
        ))}
        {messages.data?.length === 0 && <Text>No messages yet.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  page: { gap: 16, padding: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  authCard: {
    gap: 14,
    margin: 24,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  card: { gap: 12, padding: 16, borderRadius: 12, backgroundColor: "white" },
  heading: { fontSize: 28, fontWeight: "700" },
  subheading: { fontSize: 20, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  error: { color: "#b91c1c" },
  link: { color: "#1d4ed8", marginTop: 8 },
});
