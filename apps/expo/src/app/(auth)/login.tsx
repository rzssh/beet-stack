import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  type TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { FormField, FormInput } from "~/components/forms";
import { Button, InputAccessory, Text } from "~/components/ui";
import { Spinner } from "~/components/ui/spinner";
import { useLoginForm } from "~/lib/hooks";
import { authClient } from "~/utils/auth";

const INPUT_ACCESSORY_ID = "login-input-accessory";

export default function LoginScreen() {
  const form = useLoginForm();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const passwordInputRef = useRef<TextInput>(null);
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
              <form.Field name="email">
                {(field) => (
                  <FormField field={field}>
                    {(field) => (
                      <FormInput
                        field={field}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoComplete="email"
                        autoCapitalize="none"
                        onSubmitEditing={() =>
                          passwordInputRef.current?.focus()
                        }
                        returnKeyType="next"
                        inputAccessoryViewID={
                          Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined
                        }
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <FormField field={field}>
                    {(field) => (
                      <FormInput
                        ref={passwordInputRef}
                        field={field}
                        placeholder="Password"
                        secureTextEntry
                        autoComplete="password"
                        returnKeyType="go"
                        onSubmitEditing={() => form.handleSubmit()}
                        inputAccessoryViewID={
                          Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined
                        }
                      />
                    )}
                  </FormField>
                )}
              </form.Field>

              <Pressable onPress={() => {}} hitSlop={12} className="self-start">
                <Text className="text-muted-foreground">Forgot password?</Text>
              </Pressable>

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
                      <Text className="text-destructive">{submitError}</Text>
                    )}
                    <Button
                      size="lg"
                      onPress={form.handleSubmit}
                      disabled={
                        !canSubmit || isSubmitting || socialLoading !== null
                      }
                      className="mt-2 rounded-xl"
                    >
                      {isSubmitting ? (
                        <Spinner size="small" color="white" />
                      ) : (
                        <Text className="font-semibold text-lg">Sign In</Text>
                      )}
                    </Button>
                  </>
                )}
              </form.Subscribe>
            </View>

            <View className="my-10 flex-row items-center">
              <View className="h-px flex-1 bg-border" />
              {/* <Text className="mx-4 text-muted-foreground text-xs uppercase tracking-wider"> */}
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
              <Link href="/(auth)/signup" asChild>
                <Pressable hitSlop={12}>
                  <Text className="font-semibold text-primary">Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          <InputAccessory />
        </InputAccessoryView>
      )}
    </>
  );
}
