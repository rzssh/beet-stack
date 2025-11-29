import { useColorScheme } from "nativewind";
import * as React from "react";
import { Image, Platform, View } from "react-native";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import { authClient } from "~/utils/auth";

const SOCIAL_PROVIDERS = [
  {
    provider: "discord",
    label: "Discord",
    icon: { uri: "https://img.clerk.com/static/discord.png?width=160" },
    useTint: false,
  },
  {
    provider: "google",
    label: "Google",
    icon: { uri: "https://img.clerk.com/static/google.png?width=160" },
    useTint: false,
  },
] as const;

export function SocialConnections() {
  const { colorScheme } = useColorScheme();
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);

  const handleSocialSignIn = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      await authClient.signIn.social({
        provider: provider as "discord" | "google",
        callbackURL: "/",
      });
    } catch (e) {
      console.error(`${provider} sign in failed:`, e);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View className="gap-3">
      {SOCIAL_PROVIDERS.map((item) => {
        const isLoading = loadingProvider === item.provider;
        return (
          <Button
            key={item.provider}
            variant="outline"
            className="h-14 gap-3"
            disabled={loadingProvider !== null}
            onPress={() => handleSocialSignIn(item.provider)}
          >
            {isLoading ? (
              <Spinner size="small" />
            ) : (
              <>
                <Image
                  source={item.icon}
                  className={cn(
                    "h-5 w-5",
                    item.useTint && Platform.select({ web: "dark:invert" }),
                  )}
                  tintColor={Platform.select({
                    native: item.useTint
                      ? colorScheme === "dark"
                        ? "white"
                        : "black"
                      : undefined,
                  })}
                />
                <Text className="text-base">Continue with {item.label}</Text>
              </>
            )}
          </Button>
        );
      })}
    </View>
  );
}
