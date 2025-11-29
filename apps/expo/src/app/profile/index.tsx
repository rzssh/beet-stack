import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as React from "react";
import { ScrollView, View } from "react-native";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
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

  const handleEnableAllFlags = () => {
    const disabledFlags = flags.filter((flag) => !flag.isEnabled);
    disabledFlags.forEach((flag) => {
      setFlagMutation.mutate({ flagId: flag.id, isEnabled: true });
    });
  };

  const handleDisableAllFlags = () => {
    const enabledFlags = flags.filter((flag) => flag.isEnabled);
    enabledFlags.forEach((flag) => {
      setFlagMutation.mutate({ flagId: flag.id, isEnabled: false });
    });
  };

  const isAuthenticated = !!session?.user;
  const user = session?.user;
  const flags = (flagsQuery.data ?? []) as FeatureFlag[];
  const enabledCount = flags.filter((f) => f.isEnabled).length;

  if (sessionLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ title: "Profile" }} />
        <Spinner label="Loading..." />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: "Profile" }} />
        <View className="flex-1 items-center justify-center gap-6 px-6">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Text className="text-5xl">👤</Text>
          </View>
          <View className="items-center gap-2">
            <Text className="font-semibold text-2xl text-foreground">
              Welcome
            </Text>
            <Text className="text-center text-muted-foreground">
              Sign in to access your profile and settings
            </Text>
          </View>
          <View className="w-full gap-3">
            <Button onPress={() => router.push("/(auth)/login")}>
              <Text>Sign In</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text>Create Account</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Profile" }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <View className="items-center gap-4 rounded-xl border border-border bg-card p-6">
          <Avatar alt={user?.name ?? "User"} className="h-20 w-20">
            {user?.image ? (
              <AvatarImage source={{ uri: user.image }} />
            ) : (
              <AvatarFallback className="bg-primary">
                <Text className="font-bold text-2xl text-primary-foreground">
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </AvatarFallback>
            )}
          </Avatar>
          <View className="items-center gap-1">
            <Text className="font-semibold text-card-foreground text-xl">
              {user?.name ?? "User"}
            </Text>
            <Text className="text-muted-foreground">{user?.email}</Text>
          </View>
        </View>

        <View className="rounded-xl border border-border bg-card p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="font-semibold text-card-foreground text-lg">
                Feature Flags
              </Text>
              <Text className="text-muted-foreground text-xs">
                {enabledCount} of {flags.length} enabled
              </Text>
            </View>
            {flags.length > 0 && (
              <View className="flex-row gap-2">
                <Button
                  size="sm"
                  onPress={handleEnableAllFlags}
                  disabled={
                    setFlagMutation.isPending || enabledCount === flags.length
                  }
                  className={
                    enabledCount === flags.length ? "bg-muted" : "bg-green-600"
                  }
                >
                  <Text>All On</Text>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onPress={handleDisableAllFlags}
                  disabled={setFlagMutation.isPending || enabledCount === 0}
                >
                  <Text>All Off</Text>
                </Button>
              </View>
            )}
          </View>

          {flagsQuery.isLoading ? (
            <View className="gap-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </View>
          ) : flags.length === 0 ? (
            <View className="items-center rounded-lg bg-muted py-8">
              <Text className="text-4xl">🚩</Text>
              <Text className="mt-2 text-muted-foreground">
                No feature flags available
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {flags.map((flag, index) => (
                <React.Fragment key={flag.id}>
                  {index > 0 && <Separator />}
                  <View className="flex-row items-center justify-between rounded-lg bg-muted p-4">
                    <View className="flex-1 pr-4">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-medium text-foreground capitalize">
                          {flag.name.replace(/_/g, " ")}
                        </Text>
                        {flag.hasOverride && (
                          <View className="rounded-full bg-primary/20 px-2 py-0.5">
                            <Text className="text-primary text-xs">Custom</Text>
                          </View>
                        )}
                      </View>
                      {flag.description && (
                        <Text className="mt-1 text-muted-foreground text-xs">
                          {flag.description}
                        </Text>
                      )}
                    </View>
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={() =>
                        handleToggleFlag(flag.id, flag.isEnabled)
                      }
                      disabled={setFlagMutation.isPending}
                    />
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        <View className="rounded-xl border border-border bg-card p-4">
          <Text className="mb-3 font-semibold text-card-foreground text-lg">
            Account
          </Text>
          <Button
            variant="destructive"
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text>Sign Out</Text>
            )}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
