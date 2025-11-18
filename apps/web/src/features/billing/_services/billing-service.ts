import { api } from "@acme/api";

export interface BillingProduct {
  id: string;
  name: string;
  description?: string | null;
  prices: Array<{
    id: string;
    amount: number;
    currency: string;
    interval?: string | null;
    nickname?: string | null;
  }>;
}

export const billingService = {
  async listProducts() {
    const { data, error, status } = await api.billing.products.get();
    if (error || status >= 400) {
      throw new Error(
        error?.message ||
          "Billing API unavailable. Configure STRIPE_SECRET_KEY.",
      );
    }
    return data?.products ?? [];
  },

  async createSubscription({
    customerId,
    priceId,
    trialPeriodDays,
  }: {
    customerId: string;
    priceId: string;
    trialPeriodDays?: number;
  }) {
    const { data, error } = await api.billing.subscriptions.post({
      customerId,
      priceId,
      trialPeriodDays,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data?.subscription;
  },

  async createPortalSession({
    customerId,
    returnUrl,
  }: {
    customerId: string;
    returnUrl: string;
  }) {
    const { data, error } = await api.billing.portal.post({
      customerId,
      returnUrl,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data?.url;
  },
};
