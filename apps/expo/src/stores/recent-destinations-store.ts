import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface RecentDestination {
  placeId: string;
  address: string;
  lat: number;
  lng: number;
  name?: string;
  timestamp: number;
}

interface RecentDestinationsState {
  destinations: RecentDestination[];
  addDestination: (dest: Omit<RecentDestination, "timestamp">) => void;
  removeDestination: (placeId: string) => void;
  clearAll: () => void;
  syncFromServer: (serverDestinations: RecentDestination[]) => void;
}

export const useRecentDestinationsStore = create<RecentDestinationsState>()(
  persist(
    (set, get) => ({
      destinations: [],

      addDestination: (dest) => {
        const existing = get().destinations.filter(
          (d) => d.placeId !== dest.placeId
        );
        const newDest: RecentDestination = {
          ...dest,
          timestamp: Date.now(),
        };
        set({ destinations: [newDest, ...existing].slice(0, 10) });
      },

      removeDestination: (placeId) => {
        set({
          destinations: get().destinations.filter((d) => d.placeId !== placeId),
        });
      },

      clearAll: () => set({ destinations: [] }),

      syncFromServer: (serverDestinations) => {
        const local = get().destinations;
        const merged = new Map<string, RecentDestination>();

        for (const dest of serverDestinations) {
          merged.set(dest.placeId, dest);
        }

        for (const dest of local) {
          const existing = merged.get(dest.placeId);
          if (!existing || dest.timestamp > existing.timestamp) {
            merged.set(dest.placeId, dest);
          }
        }

        const sorted = Array.from(merged.values())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);

        set({ destinations: sorted });
      },
    }),
    {
      name: "recent-destinations",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
