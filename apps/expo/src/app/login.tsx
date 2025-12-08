import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { revalidateLogic } from "@tanstack/react-form";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, useColorScheme, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { Button, KeyboardToolbar, Text } from "~/components/ui";
import { Spinner } from "~/components/ui/spinner";
import { authClient } from "~/lib/auth";
import { useAppForm } from "~/lib/form";
import { loginSchema } from "~/lib/schema";

export default function LoginScreen() {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        router.replace("/");
      } catch (error) {
        console.error("Sign in error:", error);
        throw error;
      }
    },
  });
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const iconColor = isDark ? "#a1a1aa" : "#52525b";

  const handleSocialSignIn = async (provider: "google" | "discord") => {
    setSocialLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch (e) {
      console.error(`${provider} sign in failed:`, e);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <>
      <View className="flex-1">
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 32,
            paddingVertical: 48,
          }}
          keyboardShouldPersistTaps="handled"
          bottomOffset={50}
          bounces={false}
        >
          <Text className="font-bold text-4xl text-foreground">Sign in</Text>
          <Text className="mt-3 text-lg text-muted-foreground">
            Welcome back to your account
          </Text>

          <View className="mt-12 gap-6">
            <form.AppField
              name="email"
              children={(field) => (
                <field.EmailField
                  label="Email"
                  placeholder="Enter your email"
                  returnKeyType="next"
                />
              )}
            />

            <form.AppField
              name="password"
              children={(field) => (
                <field.PasswordField
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="password"
                  returnKeyType="go"
                  onSubmitEditing={() => form.handleSubmit()}
                />
              )}
            />

            <Pressable onPress={() => {}} hitSlop={12} className="self-start">
              <Text className="text-muted-foreground">Forgot password?</Text>
            </Pressable>

            <form.AppForm>
              <form.FormError />
              <form.SubmitButton
                label="Sign In"
                disabled={socialLoading !== null}
                className="mt-2"
              />
            </form.AppForm>
          </View>

          <View className="my-10 flex-row items-center">
            <View className="h-px flex-1 bg-border" />
            <Text className="mx-4 text-muted-foreground text-xs uppercase">
              or continue with
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <View className="gap-4">
            <Button
              size="lg"
              variant="outline"
              onPress={() => handleSocialSignIn("google")}
              disabled={socialLoading !== null}
              className="gap-3"
            >
              {socialLoading === "google" ? (
                <Spinner size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={22} color={iconColor} />
                  <Text className="font-medium text-base">Google</Text>
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onPress={() => handleSocialSignIn("discord")}
              disabled={socialLoading !== null}
              className="gap-3"
            >
              {socialLoading === "discord" ? (
                <Spinner size="small" />
              ) : (
                <>
                  <FontAwesome6 name="discord" size={18} color={iconColor} />
                  <Text className="font-medium text-base">Discord</Text>
                </>
              )}
            </Button>
          </View>

          <View className="mt-12 flex-row items-center justify-center gap-1">
            <Text className="text-muted-foreground">
              Don't have an account?
            </Text>
            <Link href="/onboarding" asChild>
              <Pressable hitSlop={12}>
                <Text className="font-semibold text-primary">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </KeyboardAwareScrollView>
      </View>

      <KeyboardToolbar />
    </>
  );
}
