import { useEffect, useState } from "react";
import { View } from "react-native";

import { Button, Card, CardContent, Spinner, Text } from "~/components/ui";

interface RideSearchingStateProps {
  searchStartTime: number;
  onCancel: () => void;
  isCanceling: boolean;
}

export function RideSearchingState({
  searchStartTime,
  onCancel,
  isCanceling,
}: RideSearchingStateProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!searchStartTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - searchStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [searchStartTime]);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="gap-4">
      <Text variant="h3" className="text-white">
        Finding Your Ride
      </Text>

      <Card className="border-zinc-700 bg-zinc-800">
        <CardContent className="items-center gap-4 pt-6 pb-6">
          <Spinner size="large" color="#3b82f6" />
          <View className="items-center">
            <Text className="font-semibold text-white text-lg">
              Searching for driver...
            </Text>
            <Text className="text-zinc-400 text-sm mt-2">
              Time elapsed: {formatElapsed(elapsed)}
            </Text>
          </View>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onPress={onCancel}
        disabled={isCanceling}
        className="border-red-700"
      >
        {isCanceling ? (
          <Spinner size="small" color="white" />
        ) : (
          <Text className="text-red-400">Cancel Ride</Text>
        )}
      </Button>
    </View>
  );
}
