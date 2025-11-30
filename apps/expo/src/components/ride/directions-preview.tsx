import { View } from "react-native";

import { Card, CardContent, Spinner, Text } from "~/components/ui";

interface DirectionsPreviewProps {
  distance: number;
  duration: number;
  isLoading?: boolean;
  error?: string | null;
}

export function DirectionsPreview({
  distance,
  duration,
  isLoading,
  error,
}: DirectionsPreviewProps) {
  if (isLoading) {
    return (
      <View className="flex-row items-center gap-2">
        <Spinner size="small" color="#3b82f6" />
        <Text className="text-muted-foreground text-sm">
          Calculating route...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <Card className="border-red-700 bg-red-900/20">
        <CardContent className="pt-4">
          <Text className="text-red-400 text-sm">
            Unable to calculate route. Please try different locations.
          </Text>
        </CardContent>
      </Card>
    );
  }

  if (!distance || !duration) {
    return null;
  }

  const distanceKm = (distance / 1000).toFixed(1);
  const durationMin = Math.round(duration / 60);
  const estimatedPrice = (2.5 + (distance / 1000) * 1.5).toFixed(2);

  return (
    <Card className="border-zinc-700 bg-zinc-800">
      <CardContent className="flex-row items-center justify-between pt-4">
        <View>
          <Text variant="muted">Distance</Text>
          <Text className="font-semibold text-white">{distanceKm} km</Text>
        </View>
        <View>
          <Text variant="muted">Est. Time</Text>
          <Text className="font-semibold text-white">{durationMin} min</Text>
        </View>
        <View>
          <Text variant="muted">Est. Price</Text>
          <Text className="font-semibold text-green-400">
            ${estimatedPrice}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
