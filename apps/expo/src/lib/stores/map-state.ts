import { create } from "zustand";

export type MapMode = "default" | "pin-pickup" | "pin-dropoff";

interface MapStateStore {
  mode: MapMode;
  isPannedAway: boolean;
  pendingCoordinate: { lat: number; lng: number } | null;
  setMode: (mode: MapMode) => void;
  setPannedAway: (isPanned: boolean) => void;
  setPendingCoordinate: (coord: { lat: number; lng: number } | null) => void;
  reset: () => void;
}

export const useMapStateStore = create<MapStateStore>((set) => ({
  mode: "default",
  isPannedAway: false,
  pendingCoordinate: null,
  setMode: (mode) => set({ mode }),
  setPannedAway: (isPannedAway) => set({ isPannedAway }),
  setPendingCoordinate: (pendingCoordinate) => set({ pendingCoordinate }),
  reset: () =>
    set({ mode: "default", isPannedAway: false, pendingCoordinate: null }),
}));
