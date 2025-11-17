import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { analytics } from "~/lib/analytics";
import { useToast } from "~/controllers/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { billingService } from "../_services/billing-service";

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });

export const BillingCard = ({
  customerId,
}: {
  customerId?: string;
}) => {
  const { toast } = useToast();

  const productsQuery = useQuery({
    queryKey: ["billing-products"],
    queryFn: () => billingService.listProducts(),
  });

  const subscribeMutation = useMutation({
    mutationFn: (price: {
      id: string;
      amount: number;
      currency: string;
      nickname?: string | null;
      interval?: string | null;
    }) => {
      if (!customerId) {
        return Promise.reject(new Error("Missing customer id"));
      }

      return billingService.createSubscription({
        customerId,
        priceId: price.id,
      });
    },
    onSuccess: (_, price) => {
      toast({
        title: "Subscription created",
        description: "Stripe will finalize the checkout on the client.",
      });
      const amount = price.amount / 100;
      analytics.events.paymentStarted(price.nickname ?? "subscription", amount);
      analytics.events.paymentCompleted(price.nickname ?? "subscription", amount);
    },
    onError: (error) => {
      toast({
        title: "Unable to start subscription",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => {
      if (!customerId) {
        return Promise.reject(new Error("Missing customer id"));
      }

      return billingService.createPortalSession({
        customerId,
        returnUrl: window.location.origin,
      });
    },
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      } else {
        toast({
          title: "Portal link not available",
          description: "Check your Stripe configuration.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Unable to load billing portal",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const products = productsQuery.data ?? [];

  const headline = useMemo(() => {
    if (productsQuery.isLoading) return "Loading products...";
    if (productsQuery.isError) {
      return "Connect Stripe to enable billing";
    }
    if (products.length === 0) {
      return "Create products in your Stripe dashboard";
    }
    return "Pick a plan";
  }, [products.length, productsQuery.isError, productsQuery.isLoading]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>{headline}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {productsQuery.isError ? (
          <p className="text-sm text-muted-foreground">
            {productsQuery.error instanceof Error
              ? productsQuery.error.message
              : "Stripe configuration missing. Set STRIPE_SECRET_KEY."}
          </p>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No products found. Configure at least one active product + price in Stripe.
          </p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.description ?? "No description"}
                  </p>
                </div>
                {product.prices[0] && (
                  <div className="text-right">
                    <p className="text-xl font-semibold">
                      {currencyFormatter(product.prices[0].currency).format(
                        product.prices[0].amount / 100,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {product.prices[0].interval ?? "one-time"}
                    </p>
                  </div>
                )}
              </div>
                <Button
                  className="mt-4 w-full"
                  disabled={!customerId || subscribeMutation.isPending}
                  onClick={() => {
                    const price = product.prices[0];
                    if (!price) {
                    toast({
                      title: "Missing price",
                      description: "Add at least one active price in Stripe.",
                    });
                    return;
                  }
                  analytics.events.planSelected(product.name);
                  subscribeMutation.mutate(price);
                }}
              >
                {subscribeMutation.isPending ? "Starting checkout..." : "Start subscription"}
              </Button>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => portalMutation.mutate()}
          disabled={!customerId || portalMutation.isPending}
        >
          {portalMutation.isPending ? "Opening portal..." : "Open billing portal"}
        </Button>
        {!customerId && (
          <p className="text-xs text-muted-foreground text-center">
            Attach a Stripe customer id to the Better Auth user metadata to enable billing actions.
          </p>
        )}
      </CardFooter>
    </Card>
  );
};
