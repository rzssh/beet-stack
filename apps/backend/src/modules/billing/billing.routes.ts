import { payments } from "@acme/platform";
import { Elysia, t } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";

const subscriptionBody = t.Object({
  customerId: t.String(),
  priceId: t.String(),
  trialPeriodDays: t.Optional(t.Number()),
});

const portalBody = t.Object({
  customerId: t.String(),
  returnUrl: t.String(),
});

export const billingRoutes = new Elysia({ prefix: "/billing" })
  .use(authMiddleware)
  .guard(
    {
      auth: true,
    },
    (app) =>
      app
        .get("/products", async ({ set }) => {
          if (!payments.isConfigured) {
            set.status = 503;
            return { error: "Stripe is not configured" };
          }

          const products = await payments.listProducts();
          return { products };
        })
        .post(
          "/subscriptions",
          async ({ body, set }) => {
            if (!payments.isConfigured) {
              set.status = 503;
              return { error: "Stripe is not configured" };
            }

            const subscription = await payments.createSubscription({
              customerId: body.customerId,
              priceId: body.priceId,
              trialPeriodDays: body.trialPeriodDays,
            });

            return { subscription };
          },
          {
            body: subscriptionBody,
          },
        )
        .post(
          "/portal",
          async ({ body, set }) => {
            if (!payments.isConfigured) {
              set.status = 503;
              return { error: "Stripe is not configured" };
            }

            const session = await payments.createBillingPortalSession({
              customerId: body.customerId,
              returnUrl: body.returnUrl,
            });

            return { url: session.url };
          },
          {
            body: portalBody,
          },
        ),
  );
