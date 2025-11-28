import * as Location from "expo-location";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface LocationState {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  timestamp: number;
}

interface LocationContextValue {
  location: LocationState | null;
  error: string | null;
  isLoading: boolean;
  hasPermission: boolean | null;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const getLocation = useCallback(async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
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
      return true;
    } catch {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        setLocation({
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          heading: lastKnown.coords.heading,
          speed: lastKnown.coords.speed,
          accuracy: lastKnown.coords.accuracy,
          timestamp: lastKnown.timestamp,
        });
        setError(null);
        return true;
      }
      setError("Failed to get location");
      return false;
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    setIsLoading(true);
    await getLocation();
    setIsLoading(false);
  }, [getLocation]);

  const startTracking = useCallback(async () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
    }

    try {
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
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
    } catch {
      setError("Failed to start tracking");
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      if (existingStatus === "granted") {
        if (mounted) {
          setHasPermission(true);
          await getLocation();
          setIsLoading(false);
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!mounted) return;

      if (status === "granted") {
        setHasPermission(true);
        await getLocation();
      } else {
        setHasPermission(false);
        setError("Location permission denied");
      }

      setIsLoading(false);
    };

    init();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, [getLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        error,
        isLoading,
        hasPermission,
        isTracking,
        startTracking,
        stopTracking,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within LocationProvider");
  }
  return context;
}
