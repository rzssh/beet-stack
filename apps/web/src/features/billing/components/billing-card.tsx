import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface BillingCardProps {
  customerId: string;
}

export function BillingCard({ customerId }: BillingCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Billing</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Plan:</span>{" "}
            <span className="text-muted-foreground">Free</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Status:</span>{" "}
            <span className="text-green-600">Active</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            Manage Subscription
          </Button>
          <Button variant="ghost" size="sm" className="w-full">
            View Usage
          </Button>
        </div>

        {customerId && (
          <div className="text-muted-foreground text-xs">
            Customer ID: {customerId.slice(0, 12)}...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
