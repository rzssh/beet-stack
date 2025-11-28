import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  Text,
} from "~/components/ui";
import { flagMutations, flagQueries } from "~/utils/api";
import { authClient } from "~/utils/auth";

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  hasOverride?: boolean;
}

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const flagsQuery = useQuery({
    ...flagQueries.me(),
    enabled: !!session?.user,
  });

  const setFlagMutation = useMutation({
    ...flagMutations.setFlag(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
    },
  });

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.replace("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleToggleFlag = (flagId: string, currentValue: boolean) => {
    setFlagMutation.mutate({ flagId, isEnabled: !currentValue });
  };

  if (sessionLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ title: "Profile" }} />
        <Spinner label="Loading..." />
      </SafeAreaView>
    );
  }

  if (!session?.user) {
    router.replace("/(auth)/login");
    return null;
  }

  const user = session.user;
  const flags = (flagsQuery.data ?? []) as FeatureFlag[];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Profile",
          headerStyle: { backgroundColor: "#c03484" },
          headerTintColor: "#FFFFFF",
        }}
      />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card>
          <CardContent className="flex-row items-center gap-4 pt-6">
            <Avatar alt={user.name ?? "User"} className="h-16 w-16">
              {user.image ? (
                <AvatarImage source={{ uri: user.image }} />
              ) : (
                <AvatarFallback>
                  <Text variant="h2">{user.name?.[0]?.toUpperCase() ?? "?"}</Text>
                </AvatarFallback>
              )}
            </Avatar>
            <View className="flex-1">
              <Text variant="h3">{user.name ?? "User"}</Text>
              <Text variant="muted">{user.email}</Text>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>
              Toggle features for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            {flagsQuery.isLoading ? (
              <View className="gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </View>
            ) : flags.length === 0 ? (
              <Text variant="muted" className="text-center py-4">
                No feature flags available
              </Text>
            ) : (
              flags.map((flag, index) => (
                <React.Fragment key={flag.id}>
                  {index > 0 && <Separator />}
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-1 pr-4">
                      <Text className="font-medium capitalize">
                        {flag.name.replace(/_/g, " ")}
                      </Text>
                      {flag.description && (
                        <Text variant="muted" className="text-sm">
                          {flag.description}
                        </Text>
                      )}
                    </View>
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={() => handleToggleFlag(flag.id, flag.isEnabled)}
                      disabled={setFlagMutation.isPending}
                    />
                  </View>
                </React.Fragment>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onPress={handleSignOut}
              disabled={isSigningOut}
              className="w-full"
            >
              {isSigningOut ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text>Sign Out</Text>
              )}
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
