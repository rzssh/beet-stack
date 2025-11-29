import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Link, router } from "expo-router";
import * as React from "react";
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

import { Button, Input, InputAccessory, Text } from "~/components/ui";
import { Spinner } from "~/components/ui/spinner";
import { authClient } from "~/utils/auth";

const INPUT_ACCESSORY_ID = "login-input-accessory";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [socialLoading, setSocialLoading] = React.useState<string | null>(null);

  const iconColor = isDark ? "#a1a1aa" : "#52525b";

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
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                returnKeyType="next"
                inputAccessoryViewID={
                  Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined
                }
              />

              <Input
                ref={passwordInputRef}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleEmailSignIn}
                inputAccessoryViewID={
                  Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined
                }
              />

              <Pressable onPress={() => {}} hitSlop={12} className="self-start">
                <Text className="text-muted-foreground">Forgot password?</Text>
              </Pressable>

              {error && <Text className="text-destructive">{error}</Text>}

              <Button
                size="lg"
                onPress={handleEmailSignIn}
                disabled={isLoading}
                className="mt-2"
              >
                {isLoading ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <Text className="font-semibold text-lg">Sign In</Text>
                )}
              </Button>
            </View>

            <View className="my-10 flex-row items-center">
              <View className="h-px flex-1 bg-border" />
              <Text className="mx-4 text-muted-foreground text-xs uppercase tracking-wider">
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
