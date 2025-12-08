import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserMode = "rider" | "driver";

interface TaxiModeState {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  toggleMode: () => void;
}

export const useTaxiModeStore = create<TaxiModeState>()(
  persist(
    (set) => ({
      mode: "rider",
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === "rider" ? "driver" : "rider",
        })),
    }),
    {
      name: "taxi-mode-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
