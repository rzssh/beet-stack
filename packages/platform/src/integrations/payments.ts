import Stripe from "stripe";
import { env } from "../config/env";

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-09-30.acacia",
    })
  : null;

const requireStripe = () => {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
};

export interface CreatePaymentIntentOptions {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionOptions {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}

export interface BillingPortalOptions {
  customerId: string;
  returnUrl: string;
}

export const payments = {
  isConfigured: Boolean(stripe),

  createPaymentIntent(options: CreatePaymentIntentOptions) {
    requireStripe();
    return stripe!.paymentIntents.create({
      amount: options.amount,
      currency: options.currency ?? "usd",
      customer: options.customerId,
      metadata: options.metadata,
      automatic_payment_methods: { enabled: true },
    });
  },

  confirmPaymentIntent(paymentIntentId: string) {
    requireStripe();
    return stripe!.paymentIntents.confirm(paymentIntentId);
  },

  createCustomer({
    email,
    name,
    metadata,
  }: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }) {
    requireStripe();
    return stripe!.customers.create({ email, name, metadata });
  },

  updateCustomer(customerId: string, data: Record<string, unknown>) {
    requireStripe();
    return stripe!.customers.update(customerId, data);
  },

  createSubscription(options: CreateSubscriptionOptions) {
    requireStripe();
    return stripe!.subscriptions.create({
      customer: options.customerId,
      items: [{ price: options.priceId }],
      trial_period_days: options.trialPeriodDays,
      metadata: options.metadata,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
  },

  cancelSubscription(subscriptionId: string) {
    requireStripe();
    return stripe!.subscriptions.cancel(subscriptionId);
  },

  createBillingPortalSession(options: BillingPortalOptions) {
    requireStripe();
    return stripe!.billingPortal.sessions.create({
      customer: options.customerId,
      return_url: options.returnUrl,
    });
  },

  listProducts: async () => {
    requireStripe();
    const products = await stripe!.products.list({
      active: true,
    });

    return Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe!.prices.list({
          product: product.id,
          active: true,
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          prices: prices.data.map((price) => ({
            id: price.id,
            amount: price.unit_amount ?? 0,
            currency: price.currency,
            interval: price.recurring?.interval,
            nickname: price.nickname,
          })),
        };
      }),
    );
  },
};

export type PaymentsClient = typeof payments;
