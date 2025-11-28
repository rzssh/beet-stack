import { Link, router } from "expo-router";
import * as React from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Input, Separator, Spinner, Text } from "~/components/ui";
import { authClient } from "~/utils/auth";

export default function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

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
              Taxi App
            </Text>
            <Text variant="muted">Sign in to your account</Text>
          </View>

          <View className="gap-4">
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              error={error && !password ? error : undefined}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {error && (
              <Text variant="small" className="text-destructive">
                {error}
              </Text>
            )}

            <Button
              onPress={handleEmailSignIn}
              disabled={isLoading || isGoogleLoading}
              className="mt-2"
            >
              {isLoading ? <Spinner size="small" color="white" /> : <Text>Sign In</Text>}
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
                <Text>Sign in with Google</Text>
              )}
            </Button>

            <View className="mt-6 flex-row justify-center gap-1">
              <Text variant="muted">Don't have an account?</Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable>
                  <Text className="text-primary">Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
