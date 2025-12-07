import { useCallback, useEffect, useMemo, useState } from "react";

type SheetState = "collapsed" | "expanded" | "active-ride";

interface UseBottomSheetStateOptions {
  hasActiveRide: boolean;
}

export function useBottomSheetState({ hasActiveRide }: UseBottomSheetStateOptions) {
  const [state, setState] = useState<SheetState>(hasActiveRide ? "active-ride" : "collapsed");

  useEffect(() => {
    if (hasActiveRide && state !== "active-ride") {
      setState("active-ride");
    } else if (!hasActiveRide && state === "active-ride") {
      setState("collapsed");
    }
  }, [hasActiveRide, state]);

  const snapPoints = useMemo(() => {
    if (hasActiveRide) {
      return ["25%", "60%"];
    }
    return ["15%", "85%"];
  }, [hasActiveRide]);

  const snapIndex = useMemo(() => {
    switch (state) {
      case "collapsed":
        return 0;
      case "expanded":
        return 1;
      case "active-ride":
        return 1;
      default:
        return 0;
    }
  }, [state]);

  const goToCollapsed = useCallback(() => {
    if (!hasActiveRide) {
      setState("collapsed");
    }
  }, [hasActiveRide]);

  const goToExpanded = useCallback(() => {
    if (!hasActiveRide) {
      setState("expanded");
    }
  }, [hasActiveRide]);

  const goToActiveRide = useCallback(() => {
    setState("active-ride");
  }, []);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (hasActiveRide) return;

      if (index === 0) {
        setState("collapsed");
      } else if (index === 1) {
        setState("expanded");
      }
    },
    [hasActiveRide]
  );

  return {
    state,
    snapIndex,
    snapPoints,
    goToCollapsed,
    goToExpanded,
    goToActiveRide,
    handleSheetChange,
  };
}
