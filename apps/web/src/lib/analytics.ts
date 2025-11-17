import posthog from "posthog-js";

class Analytics {
  private initialized = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;

    const key = import.meta.env.VITE_POSTHOG_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

    if (!key) {
      console.warn("PostHog key not found");
      return;
    }

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
    });

    this.initialized = true;
  }

  identify(userId: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.identify(userId, properties);
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.capture(event, properties);
  }

  pageview(pathname?: string) {
    if (!this.initialized) return;
    posthog.capture("$pageview", {
      $current_url: pathname || window.location.href,
    });
  }

  reset() {
    if (!this.initialized) return;
    posthog.reset();
  }

  // Common events for SaaS apps
  events = {
    signUp: (method: string) => this.track("user_signed_up", { method }),
    signIn: (method: string) => this.track("user_signed_in", { method }),
    signOut: () => this.track("user_signed_out"),
    
    // Payment events
    planSelected: (plan: string) => this.track("plan_selected", { plan }),
    paymentStarted: (plan: string, amount: number) => this.track("payment_started", { plan, amount }),
    paymentCompleted: (plan: string, amount: number) => this.track("payment_completed", { plan, amount }),
    
    // Feature usage
    featureUsed: (feature: string) => this.track("feature_used", { feature }),
    
    // Custom events
    custom: (event: string, properties?: Record<string, any>) => this.track(event, properties),
  };
}

export const analytics = new Analytics();
