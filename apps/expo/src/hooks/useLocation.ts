import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

export interface LocationState {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  timestamp: number;
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  trackingInterval?: number;
  distanceInterval?: number;
}

interface UseLocationResult {
  location: LocationState | null;
  error: string | null;
  isLoading: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  isTracking: boolean;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationResult {
  const {
    enableHighAccuracy = true,
    trackingInterval = 5000,
    distanceInterval = 10,
  } = options;

  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        setError("Location permission denied");
        setHasPermission(false);
        return false;
      }

      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      setError("Failed to request location permission");
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: enableHighAccuracy
          ? Location.Accuracy.BestForNavigation
          : Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        heading: currentLocation.coords.heading,
        speed: currentLocation.coords.speed,
        accuracy: currentLocation.coords.accuracy,
        timestamp: currentLocation.timestamp,
      });
      setError(null);
    } catch (err) {
      setError("Failed to get current location");
    } finally {
      setIsLoading(false);
    }
  }, [enableHighAccuracy]);

  const startTracking = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
    }

    try {
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: enableHighAccuracy
            ? Location.Accuracy.BestForNavigation
            : Location.Accuracy.Balanced,
          timeInterval: trackingInterval,
          distanceInterval: distanceInterval,
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            accuracy: newLocation.coords.accuracy,
            timestamp: newLocation.timestamp,
          });
          setError(null);
        },
      );
      setIsTracking(true);
    } catch (err) {
      setError("Failed to start location tracking");
    }
  }, [hasPermission, requestPermission, enableHighAccuracy, trackingInterval, distanceInterval]);

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        await getCurrentLocation();
      } else {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, [getCurrentLocation]);

  return {
    location,
    error,
    isLoading,
    hasPermission,
    requestPermission,
    startTracking,
    stopTracking,
    isTracking,
  };
}
