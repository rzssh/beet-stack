import * as React from "react";
import { useColorScheme, View } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Spinner } from "~/components/ui/spinner";
import { authClient } from "~/utils/auth";

type SocialProvider = "google" | "discord";

interface SocialProviderConfig {
  provider: SocialProvider;
  label: string;
  renderIcon: (color: string, size: number) => React.ReactNode;
}

const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  {
    provider: "google",
    label: "Google",
    renderIcon: (color, size) => (
      <Ionicons name="logo-google" size={size} color={color} />
    ),
  },
  {
    provider: "discord",
    label: "Discord",
    renderIcon: (color, size) => (
      <FontAwesome6 name="discord" size={size} color={color} />
    ),
  },
];

export function SocialConnections() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loadingProvider, setLoadingProvider] = React.useState<SocialProvider | null>(null);

  const iconColor = isDark ? "#a1a1aa" : "#52525b";

  const handleSocialSignIn = async (provider: SocialProvider) => {
    setLoadingProvider(provider);
    try {
      await authClient.signIn.social({
        provider,
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
                {item.renderIcon(iconColor, 22)}
                <Text className="text-base font-medium">{item.label}</Text>
              </>
            )}
          </Button>
        );
      })}
    </View>
  );
}
