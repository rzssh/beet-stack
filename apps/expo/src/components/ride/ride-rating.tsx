import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button, Card, CardContent, Spinner, Text } from "~/components/ui";
import { rideMutations } from "~/utils/api";

interface RideRatingProps {
  ride: {
    id: string;
    driver?: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    estimatedPrice?: number | null;
  };
  onComplete?: () => void;
}

export function RideRating({ ride, onComplete }: RideRatingProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const rateDriverMutation = useMutation({
    ...rideMutations.rateDriver(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      onComplete?.();
    },
  });

  const handleSubmit = () => {
    rateDriverMutation.mutate({
      rideId: ride.id,
      rating,
      feedback: feedback.trim() || undefined,
    });
  };

  return (
    <View className="gap-4">
      <View className="items-center gap-2">
        <Text className="text-4xl">✅</Text>
        <Text variant="h2" className="text-center text-white">
          Ride Complete!
        </Text>
        <Text className="text-center text-zinc-400">
          How was your experience?
        </Text>
      </View>

      {ride.driver && (
        <Card className="border-zinc-700 bg-zinc-800">
          <CardContent className="items-center gap-3 pt-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-zinc-700">
              <Text className="text-2xl">
                {ride.driver.name?.[0]?.toUpperCase() ?? "D"}
              </Text>
            </View>
            <Text className="text-white text-lg font-semibold">
              {ride.driver.name ?? "Your Driver"}
            </Text>
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-700 bg-zinc-800">
        <CardContent className="items-center gap-4 pt-4">
          <Text className="text-white">Rate your driver</Text>

          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                className="p-2"
              >
                <Text className="text-3xl">
                  {star <= rating ? "⭐" : "☆"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-zinc-400 text-sm">
            {rating === 5
              ? "Excellent!"
              : rating === 4
                ? "Good"
                : rating === 3
                  ? "Average"
                  : rating === 2
                    ? "Below Average"
                    : "Poor"}
          </Text>
        </CardContent>
      </Card>

      {ride.estimatedPrice && (
        <Card className="border-zinc-700 bg-zinc-800">
          <CardContent className="flex-row items-center justify-between pt-4">
            <Text className="text-white">Total Fare</Text>
            <Text variant="h2" className="text-green-400">
              ${ride.estimatedPrice.toFixed(2)}
            </Text>
          </CardContent>
        </Card>
      )}

      <Button
        onPress={handleSubmit}
        disabled={rateDriverMutation.isPending}
        className="bg-blue-500"
      >
        {rateDriverMutation.isPending ? (
          <Spinner size="small" color="white" />
        ) : (
          <Text className="font-semibold">Submit Rating</Text>
        )}
      </Button>

      {onComplete && (
        <Button variant="ghost" onPress={onComplete}>
          <Text>Skip</Text>
        </Button>
      )}
    </View>
  );
}
