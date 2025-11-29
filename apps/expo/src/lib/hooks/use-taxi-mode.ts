import { useTaxiModeStore } from "~/lib/stores/taxi-mode-store";

export function useTaxiMode() {
  const { mode, setMode, toggleMode } = useTaxiModeStore();

  return {
    mode,
    isRider: mode === "rider",
    isDriver: mode === "driver",
    setMode,
    toggleMode,
  };
}
