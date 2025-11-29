import * as React from "react";
import { useColorScheme, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Spinner } from "~/components/ui/spinner";
import { authClient } from "~/utils/auth";

const SOCIAL_PROVIDERS = [
  {
    provider: "google",
    label: "Google",
    Icon: Ionicons,
    iconName: "logo-google" as const,
  },
  {
    provider: "discord",
    label: "Discord",
    Icon: MaterialCommunityIcons,
    iconName: "discord" as const,
  },
] as const;

export function SocialConnections() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loadingProvider, setLoadingProvider] = React.useState<string | null>(null);

  const iconColor = isDark ? "#a1a1aa" : "#52525b";

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
    <View className="gap-4">
      {SOCIAL_PROVIDERS.map((item) => {
        const isLoading = loadingProvider === item.provider;
        return (
          <Button
            key={item.provider}
            size="lg"
            variant="outline"
            className="gap-3"
            disabled={loadingProvider !== null}
            onPress={() => handleSocialSignIn(item.provider)}
          >
            {isLoading ? (
              <Spinner size="small" />
            ) : (
              <>
                <item.Icon name={item.iconName} size={22} color={iconColor} />
                <Text className="text-base font-medium">{item.label}</Text>
              </>
            )}
          </Button>
        );
      })}
    </View>
  );
}
