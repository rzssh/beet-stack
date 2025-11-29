import { Link, router } from "expo-router";
import * as React from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  type TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { SocialConnections } from "~/components/SocialConnections";
import { Button, Input, InputAccessory, Separator, Text } from "~/components/ui";
import { Spinner } from "~/components/ui/spinner";
import { authClient } from "~/utils/auth";

const INPUT_ACCESSORY_ID = "login-input-accessory";

export default function LoginScreen() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Sign in failed");
        return;
      }

      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          keyboardShouldPersistTaps="handled"
          bottomOffset={50}
        >
          {/* Header */}
          <View className="mb-10 items-center">
            <View className="mb-5 h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-lg">
              <Text className="text-5xl">🚕</Text>
            </View>
            <Text className="mb-2 text-3xl font-bold text-foreground">
              Welcome back
            </Text>
            <Text className="text-center text-base text-muted-foreground">
              Sign in to continue your journey
            </Text>
          </View>

          {/* Social Login */}
          <SocialConnections />

          {/* Divider */}
          <View className="my-8 flex-row items-center">
            <Separator className="flex-1" />
            <Text className="px-4 text-muted-foreground text-xs uppercase tracking-widest">
              or
            </Text>
            <Separator className="flex-1" />
          </View>

          {/* Email Form */}
          <View className="gap-5">
            <View className="gap-2">
              <Text className="font-semibold text-foreground">Email</Text>
              <Input
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                returnKeyType="next"
                inputAccessoryViewID={Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined}
                className="h-12"
              />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-foreground">Password</Text>
                <Pressable onPress={() => {}} hitSlop={8}>
                  <Text className="text-primary text-sm font-medium">Forgot password?</Text>
                </Pressable>
              </View>
              <Input
                ref={passwordInputRef}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleEmailSignIn}
                inputAccessoryViewID={Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined}
                className="h-12"
              />
            </View>

            {error && (
              <View className="rounded-lg bg-destructive/10 px-4 py-3">
                <Text className="text-center text-destructive text-sm font-medium">{error}</Text>
              </View>
            )}

            <Button onPress={handleEmailSignIn} disabled={isLoading} className="h-12 mt-2">
              {isLoading ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text className="text-base font-semibold">Sign In</Text>
              )}
            </Button>
          </View>

          {/* Footer */}
          <View className="mt-10 flex-row items-center justify-center">
            <Text className="text-muted-foreground">
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable hitSlop={8}>
                <Text className="font-bold text-primary">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          <InputAccessory />
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}
