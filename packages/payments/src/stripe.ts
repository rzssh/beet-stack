import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-09-30.acacia",
});

export interface CreatePaymentIntentOptions {
  amount: number; // in cents
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionOptions {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  prices: Price[];
}

export interface Price {
  id: string;
  amount: number;
  currency: string;
  interval?: "month" | "year" | null;
  nickname?: string;
}

export const payments = {
  // Payment Intents (one-time payments)
  createPaymentIntent: async (options: CreatePaymentIntentOptions) => {
    return stripe.paymentIntents.create({
      amount: options.amount,
      currency: options.currency || "usd",
      customer: options.customerId,
      metadata: options.metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  },

  confirmPaymentIntent: async (paymentIntentId: string) => {
    return stripe.paymentIntents.confirm(paymentIntentId);
  },

  // Customers
  createCustomer: async ({ email, name, metadata }: { email: string; name?: string; metadata?: Record<string, string> }) => {
    return stripe.customers.create({
      email,
      name,
      metadata,
    });
  },

  getCustomer: async (customerId: string) => {
    return stripe.customers.retrieve(customerId);
  },

  updateCustomer: async (customerId: string, data: Partial<{ email: string; name: string; metadata: Record<string, string> }>) => {
    return stripe.customers.update(customerId, data);
  },

  // Subscriptions
  createSubscription: async (options: CreateSubscriptionOptions) => {
    return stripe.subscriptions.create({
      customer: options.customerId,
      items: [{ price: options.priceId }],
      metadata: options.metadata,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
  },

  getSubscription: async (subscriptionId: string) => {
    return stripe.subscriptions.retrieve(subscriptionId);
  },

  cancelSubscription: async (subscriptionId: string) => {
    return stripe.subscriptions.cancel(subscriptionId);
  },

  updateSubscription: async (subscriptionId: string, priceId: string) => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0]?.id,
          price: priceId,
        },
      ],
    });
  },

  // Products and Prices
  listProducts: async (): Promise<Product[]> => {
    const products = await stripe.products.list({ active: true });
    const productPromises = products.data.map(async (product) => {
      const prices = await stripe.prices.list({ product: product.id, active: true });
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        prices: prices.data.map((price) => ({
          id: price.id,
          amount: price.unit_amount || 0,
          currency: price.currency,
          interval: price.recurring?.interval || null,
          nickname: price.nickname,
        })),
      };
    });
    return Promise.all(productPromises);
  },

  // Webhooks
  constructEvent: (payload: string | Buffer, signature: string, endpointSecret: string) => {
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  },

  // Billing Portal
  createBillingPortalSession: async (customerId: string, returnUrl: string) => {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  },
};

export { stripe };
