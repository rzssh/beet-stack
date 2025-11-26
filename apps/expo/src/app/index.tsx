import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInput as TextInputType,
  View,
} from "react-native";
import {
  KeyboardAvoidingView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { messageMutations, messageQueries } from "~/utils/api";
import { authClient } from "~/utils/auth";

type MessagesQuery = ReturnType<typeof messageQueries.all>;
type Messages = Awaited<ReturnType<MessagesQuery["queryFn"]>>;
type Message = Messages[number];

function MessageCard(props: { message: Message; onDelete: () => void }) {
  return (
    <View className="flex flex-row rounded-lg bg-muted p-4">
      <View className="grow">
        <Link
          asChild
          href={{ pathname: "/message/[id]", params: { id: props.message.id } }}
        >
          <Pressable className="">
            <Text className="font-semibold text-primary text-xl">
              {props.message.title}
            </Text>
            <Text className="mt-2 text-foreground">
              {props.message.content}
            </Text>
          </Pressable>
        </Link>
      </View>
      <Pressable onPress={props.onDelete}>
        <Text className="font-bold text-primary uppercase">Delete</Text>
      </Pressable>
    </View>
  );
}

function CreateMessage() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const contentRef = useRef<TextInputType>(null);

  const { mutate, error, isPending } = useMutation({
    ...messageMutations.create(),
    async onSuccess() {
      setTitle("");
      setContent("");
      await queryClient.invalidateQueries({ queryKey: ["messages", "all"] });
    },
  });

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      mutate({ title, content });
    }
  };

  return (
    <View className="flex gap-2 border-input border-t bg-background p-4 pb-6">
      <TextInput
        className="items-center rounded-md border border-input bg-background px-3 text-foreground text-lg leading-tight"
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        returnKeyType="next"
        onSubmitEditing={() => contentRef.current?.focus()}
      />
      <TextInput
        ref={contentRef}
        className="items-center rounded-md border border-input bg-background px-3 text-foreground text-lg leading-tight"
        value={content}
        onChangeText={setContent}
        placeholder="Content"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <Pressable
        className="flex items-center rounded-sm bg-primary p-2"
        onPress={handleSubmit}
        disabled={isPending}
      >
        <Text className="text-foreground">
          {isPending ? "Creating..." : "Create"}
        </Text>
      </Pressable>
      {error && (
        <Text className="mt-2 text-destructive">
          {error instanceof Error ? error.message : "Failed to create message"}
        </Text>
      )}
    </View>
  );
}

function MobileAuth() {
  const { data: session } = authClient.useSession();

  return (
    <>
      <Text className="pb-2 text-center font-semibold text-foreground text-xl">
        {session?.user.name ? `Hello, ${session.user.name}` : "Not logged in"}
      </Text>
      <Pressable
        onPress={() =>
          session
            ? authClient.signOut()
            : authClient.signIn.social({
                provider: "discord",
                callbackURL: "/",
              })
        }
        className="flex items-center rounded-sm bg-primary p-2"
      >
        <Text>{session ? "Sign Out" : "Sign In With Discord"}</Text>
      </Pressable>
    </>
  );
}

export default function Index() {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery(messageQueries.all());
  const messages = messagesQuery.data ?? [];

  const deleteMessageMutation = useMutation({
    ...messageMutations.delete(),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", "all"] }),
  });

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
        <Stack.Screen options={{ title: "Home Page" }} />
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={140}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View className="p-4">
            <Text className="pb-2 text-center font-bold text-5xl text-foreground">
              Create <Text className="text-primary">T3</Text> Turbo
            </Text>

            <MobileAuth />

            <View className="py-2">
              <Text className="font-semibold text-primary italic">
                Press on a message
              </Text>
            </View>
          </View>

          {/* Messages - scrollable, takes remaining space */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: 8, padding: 16, paddingTop: 0 }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onDelete={() => deleteMessageMutation.mutate(message.id)}
              />
            ))}
          </ScrollView>

          {/* Input at bottom */}
          <CreateMessage />
        </KeyboardAvoidingView>
      </SafeAreaView>
      <KeyboardToolbar>
        <KeyboardToolbar.Next />
        <KeyboardToolbar.Prev />
        <KeyboardToolbar.Done
          onPress={(e) => {
            e.preventDefault();
            Keyboard.dismiss();
          }}
        />
      </KeyboardToolbar>
    </>
  );
}
