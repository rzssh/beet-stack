import { Link, router } from "expo-router";
import * as React from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Input, Separator, Spinner, Text } from "~/components/ui";
import { authClient } from "~/utils/auth";

export default function SignupScreen() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Sign up failed");
        return;
      }

      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign in failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-12 items-center">
            <Text variant="h1" className="mb-2">
              Create Account
            </Text>
            <Text variant="muted">Sign up to get started</Text>
          </View>

          <View className="gap-4">
            <Input
              label="Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />

            {error && (
              <Text variant="small" className="text-destructive">
                {error}
              </Text>
            )}

            <Button
              onPress={handleSignUp}
              disabled={isLoading || isGoogleLoading}
              className="mt-2"
            >
              {isLoading ? <Spinner size="small" color="white" /> : <Text>Create Account</Text>}
            </Button>

            <View className="my-4 flex-row items-center gap-4">
              <Separator className="flex-1" />
              <Text variant="muted">or continue with</Text>
              <Separator className="flex-1" />
            </View>

            <Button
              variant="outline"
              onPress={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Spinner size="small" />
              ) : (
                <Text>Sign up with Google</Text>
              )}
            </Button>

            <View className="mt-6 flex-row justify-center gap-1">
              <Text variant="muted">Already have an account?</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-primary">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
