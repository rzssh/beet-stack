import { Elysia, t } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";
import { payments } from "~/lib/payments";
import { ConfigurationError } from "~/core/errors";

const subscriptionInput = t.Object({
  customerId: t.String(),
  priceId: t.String(),
  trialPeriodDays: t.Optional(t.Number()),
});

const portalInput = t.Object({
  customerId: t.String(),
  returnUrl: t.String(),
});

export const billingRoutes = new Elysia({ prefix: "/billing" })
  .use(authMiddleware)
  .guard({ auth: true }, (app) =>
    app
      .get(
        "/products",
        async () => {
          if (!payments.isConfigured) {
            throw new ConfigurationError(
              "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
              { service: "stripe" }
            );
          }

          const products = await payments.listProducts();
          return { products };
        },
        {
          detail: {
            summary: "List Stripe products",
            tags: ["Billing"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .post(
        "/subscriptions",
        async ({ body }) => {
          if (!payments.isConfigured) {
            throw new ConfigurationError(
              "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
              { service: "stripe" }
            );
          }

          const subscription = await payments.createSubscription({
            customerId: body.customerId,
            priceId: body.priceId,
            trialPeriodDays: body.trialPeriodDays,
          });

          return { subscription };
        },
        {
          body: subscriptionInput,
          detail: {
            summary: "Create a Stripe subscription",
            tags: ["Billing"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .post(
        "/portal",
        async ({ body }) => {
          if (!payments.isConfigured) {
            throw new ConfigurationError(
              "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
              { service: "stripe" }
            );
          }

          const session = await payments.createBillingPortalSession({
            customerId: body.customerId,
            returnUrl: body.returnUrl,
          });
          return { url: session.url };
        },
        {
          body: portalInput,
          detail: {
            summary: "Create a billing portal session",
            tags: ["Billing"],
            security: [{ BearerAuth: [] }],
          },
        },
      ),
  );
