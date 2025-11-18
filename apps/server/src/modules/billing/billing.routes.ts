import { Elysia, t } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";
import { payments } from "~/lib/payments";

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
        async ({ set }) => {
          if (!payments.isConfigured) {
            set.status = 503;
            return {
              error:
                "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
            };
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
        async ({ body, set }) => {
          if (!payments.isConfigured) {
            set.status = 503;
            return {
              error:
                "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
            };
          }

          try {
            const subscription = await payments.createSubscription({
              customerId: body.customerId,
              priceId: body.priceId,
              trialPeriodDays: body.trialPeriodDays,
            });

            return { subscription };
          } catch (error) {
            set.status = 400;
            return {
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to create subscription",
            };
          }
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
        async ({ body, set }) => {
          if (!payments.isConfigured) {
            set.status = 503;
            return {
              error:
                "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
            };
          }

          try {
            const session = await payments.createBillingPortalSession({
              customerId: body.customerId,
              returnUrl: body.returnUrl,
            });
            return { url: session.url };
          } catch (error) {
            set.status = 400;
            return {
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to create billing portal session",
            };
          }
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
