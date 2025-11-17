import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
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
