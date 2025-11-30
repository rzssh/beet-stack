import type { UseQueryResult } from "@tanstack/react-query";
import * as React from "react";
import { View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { Text } from "~/components/ui";
import { darkMapStyle } from "~/constants/map-style";
import type { DirectionsResponse } from "~/hooks/useDirections";
import { decodePolyline } from "~/utils/polyline";

interface DriverMarker {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RideMapProps {
  location: { latitude: number; longitude: number } | null;
  mode: "rider" | "driver";
  driverMarkers: DriverMarker[];
  directionsQuery: UseQueryResult<DirectionsResponse, Error>;
  pickupLocation?: Location | null;
  dropoffLocation?: Location | null;
}

export const RideMap = React.forwardRef<MapView, RideMapProps>(
  ({ location, mode, driverMarkers, directionsQuery, pickupLocation, dropoffLocation }, ref) => {

    React.useEffect(() => {
      if (location && ref && "current" in ref && ref.current) {
        ref.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }, [location?.latitude, location?.longitude, ref]);

    React.useEffect(() => {
      if (directionsQuery.data?.bounds && ref && "current" in ref && ref.current) {
        ref.current.fitToCoordinates(
          [
            {
              latitude: directionsQuery.data.bounds.northeast.lat,
              longitude: directionsQuery.data.bounds.northeast.lng,
            },
            {
              latitude: directionsQuery.data.bounds.southwest.lat,
              longitude: directionsQuery.data.bounds.southwest.lng,
            },
          ],
          {
            edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
            animated: true,
          }
        );
      }
    }, [directionsQuery.data?.bounds, ref]);

    if (!location) {
      return null;
    }

    const routeCoordinates = directionsQuery.data?.polyline
      ? decodePolyline(directionsQuery.data.polyline)
      : [];

    return (
      <MapView
        ref={ref}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {mode === "rider" &&
          driverMarkers.map((marker) => (
            <Marker
              key={marker.driverId}
              identifier={`driver-${marker.driverId}`}
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              title="Driver"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-yellow-500 shadow-lg">
                <Text className="text-lg">🚗</Text>
              </View>
            </Marker>
          ))}

        {pickupLocation && (
          <Marker
            coordinate={{ latitude: pickupLocation.lat, longitude: pickupLocation.lng }}
            title="Pickup"
            identifier="pickup-marker"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-lg">
              <Text className="text-lg">📍</Text>
            </View>
          </Marker>
        )}

        {dropoffLocation && (
          <Marker
            coordinate={{ latitude: dropoffLocation.lat, longitude: dropoffLocation.lng }}
            title="Dropoff"
            identifier="dropoff-marker"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-lg">
              <Text className="text-lg">🎯</Text>
            </View>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#3b82f6"
            strokeWidth={4}
          />
        )}
      </MapView>
    );
  }
);

RideMap.displayName = "RideMap";
