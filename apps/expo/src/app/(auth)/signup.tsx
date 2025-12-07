import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormField, FormInput } from "~/components/forms";
import { Button, Separator, Spinner, Text } from "~/components/ui";
import { useSignupForm } from "~/lib/hooks";
import { authClient } from "~/utils/auth";

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
            <form.Field name="name">
              {(field) => (
                <FormField field={field} label="Name">
                  <FormInput
                    field={field}
                    placeholder="Your name"
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <FormField field={field} label="Email">
                  <FormInput
                    field={field}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <FormField field={field} label="Password">
                  <FormInput
                    field={field}
                    placeholder="At least 8 characters"
                    secureTextEntry
                    autoComplete="new-password"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.errorMap.onSubmit,
              ]}
            >
              {([canSubmit, isSubmitting, submitError]) => (
                <>
                  {submitError && (
                    <Text variant="small" className="text-destructive">
                      {submitError}
                    </Text>
                  )}
                  <Button
                    onPress={form.handleSubmit}
                    disabled={!canSubmit || isSubmitting || isGoogleLoading}
                    className="mt-2"
                  >
                    {isSubmitting ? (
                      <Spinner size="small" color="white" />
                    ) : (
                      <Text>Create Account</Text>
                    )}
                  </Button>
                </>
              )}
            </form.Subscribe>

            <View className="my-4 flex-row items-center gap-4">
              <Separator className="flex-1" />
              <Text variant="muted">or continue with</Text>
              <Separator className="flex-1" />
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
