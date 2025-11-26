import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { analytics } from "~/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();

  useEffect(() => {
    analytics.init();
  }, []);

  useEffect(() => {
    analytics.pageview(location.pathname);
  }, [location.pathname]);

  return <>{children}</>;
}
