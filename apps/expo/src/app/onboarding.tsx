import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Spinner, Text } from "~/components/ui";
import { authClient } from "~/lib/auth";
import { useSignupForm } from "~/lib/hooks";

export default function SignupScreen() {
  const form = useSignupForm();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setSocialError(null);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (e) {
      setSocialError(e instanceof Error ? e.message : "Google sign in failed");
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
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField
                  label="Name"
                  placeholder="Your name"
                  autoCapitalize="words"
                  autoComplete="name"
                />
              )}
            />

            <form.AppField
              name="email"
              children={(field) => (
                <field.EmailField
                  label="Email"
                  placeholder="you@example.com"
                />
              )}
            />

            <form.AppField
              name="password"
              children={(field) => (
                <field.PasswordField
                  label="Password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              )}
            />

            <form.AppForm>
              <form.FormError />
              <form.SubmitButton
                label="Create Account"
                disabled={isGoogleLoading}
                className="mt-2"
              />
            </form.AppForm>

            <View className="my-4 flex-row items-center gap-4">
              <View className="h-px flex-1 bg-border" />
              <Text variant="muted">or continue with</Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            <Button
              variant="outline"
              onPress={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Spinner size="small" />
              ) : (
                <Text>Sign up with Google</Text>
              )}
            </Button>

            {socialError && (
              <Text variant="small" className="text-destructive">
                {socialError}
              </Text>
            )}

            <View className="mt-6 flex-row justify-center gap-1">
              <Text variant="muted">Already have an account?</Text>
              <Link href="/login" asChild>
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
