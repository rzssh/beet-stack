import { Pressable, View } from "react-native";

import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Text } from "./text";

interface ErrorCardProps {
  title?: string;
  message: string;
  action?: { label: string; onPress: () => void };
  onDismiss?: () => void;
}

export function ErrorCard({
  title,
  message,
  action,
  onDismiss,
}: ErrorCardProps) {
  return (
    <Card className="border-red-700 bg-red-900/20">
      <CardContent className="gap-3 pt-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-1">
            {title && (
              <Text className="font-semibold text-red-400">{title}</Text>
            )}
            <Text className="text-red-300 text-sm">{message}</Text>
          </View>
          {onDismiss && (
            <Pressable
              onPress={onDismiss}
              className="ml-2 h-6 w-6 items-center justify-center"
            >
              <Text className="text-red-400">✕</Text>
            </Pressable>
          )}
        </View>
        {action && (
          <Button
            variant="outline"
            onPress={action.onPress}
            className="border-red-600"
          >
            <Text className="text-red-400">{action.label}</Text>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
