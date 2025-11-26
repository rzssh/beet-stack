import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { 
  CreditCard, 
  DollarSign,
  Calendar,
  Download,
  ExternalLink,
  Check,
  Zap,
  Star,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";

export const Route = createFileRoute("/_protected/billing")({
  component: BillingPage,
});

function BillingPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight">Billing & Usage</h1>
            <p className="text-muted-foreground">
              Manage your subscription, view usage metrics, and download invoices.
            </p>
          </div>
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Update Payment Method
          </Button>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CurrentPlanCard />
          <UsageCard />
          <NextInvoiceCard />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SubscriptionPlansCard />
            <InvoiceHistoryCard />
          </div>
          
          <div className="space-y-6">
            <PaymentMethodCard />
            <BillingContactCard />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stripe Integration</CardTitle>
            <CardDescription>
              This billing interface demonstrates Stripe integration patterns with the TanStack Start + Elysia stack.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium">
                <CreditCard className="h-4 w-4 text-blue-500" />
                Payment Processing
              </h4>
              <p className="text-muted-foreground text-sm">
                Secure payment handling with Stripe Elements and webhooks for subscription management.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium">
                <DollarSign className="h-4 w-4 text-green-500" />
                Usage-Based Billing
              </h4>
              <p className="text-muted-foreground text-sm">
                Track API usage and meter billing with automatic invoice generation and proration.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-purple-500" />
                Subscription Lifecycle
              </h4>
              <p className="text-muted-foreground text-sm">
                Handle subscription updates, cancellations, and grace periods with webhook events.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const CurrentPlanCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500" />
        Current Plan
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Pro Plan</h3>
        <p className="text-muted-foreground text-sm">Perfect for growing teams</p>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-2xl">$29</span>
        <span className="text-muted-foreground text-sm">/month</span>
      </div>

      <Badge variant="default" className="w-fit">
        Active
      </Badge>
      
      <Button variant="outline" className="w-full">
        Change Plan
      </Button>
    </CardContent>
  </Card>
);

const UsageCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-500" />
        Usage This Month
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>API Requests</span>
          <span>1,234 / 10,000</span>
        </div>
        <Progress value={12.34} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Storage</span>
          <span>2.1 GB / 10 GB</span>
        </div>
        <Progress value={21} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Users</span>
          <span>3 / 25</span>
        </div>
        <Progress value={12} className="h-2" />
      </div>
    </CardContent>
  </Card>
);

const NextInvoiceCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-green-500" />
        Next Invoice
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <p className="font-semibold text-lg">$29.00</p>
        <p className="text-muted-foreground text-sm">Due Dec 15, 2024</p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Pro Plan</span>
          <span>$29.00</span>
        </div>
        <div className="flex justify-between">
          <span>Additional Storage</span>
          <span>$5.00</span>
        </div>
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>$34.00</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SubscriptionPlansCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Available Plans</CardTitle>
      <CardDescription>
        Choose the plan that best fits your needs. All plans include core features and 24/7 support.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h4 className="font-semibold">Starter</h4>
          <p className="text-muted-foreground text-sm">Perfect for individuals</p>
          <div className="my-4">
            <span className="font-bold text-xl">$9</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              1,000 API requests
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              1 GB storage
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Email support
            </li>
          </ul>
        </div>

        <div className="rounded-lg border-2 border-primary p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Pro</h4>
            <Badge>Current</Badge>
          </div>
          <p className="text-muted-foreground text-sm">Perfect for growing teams</p>
          <div className="my-4">
            <span className="font-bold text-xl">$29</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              10,000 API requests
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              10 GB storage
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Priority support
            </li>
          </ul>
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="font-semibold">Enterprise</h4>
          <p className="text-muted-foreground text-sm">For large organizations</p>
          <div className="my-4">
            <span className="font-bold text-xl">$99</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Unlimited requests
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              1 TB storage
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Dedicated support
            </li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
);

const InvoiceHistoryCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Invoice History</CardTitle>
      <CardDescription>
        Download and view your past invoices
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[
          { date: "Nov 15, 2024", amount: "$29.00", status: "Paid" },
          { date: "Oct 15, 2024", amount: "$29.00", status: "Paid" },
          { date: "Sep 15, 2024", amount: "$29.00", status: "Paid" },
        ].map((invoice, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">{invoice.date}</p>
              <p className="text-muted-foreground text-sm">Pro Plan</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{invoice.amount}</span>
              <Badge variant="default" className="bg-green-500">
                {invoice.status}
              </Badge>
              <Button size="sm" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const PaymentMethodCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Payment Method</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded bg-primary/10 p-2">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">•••• •••• •••• 4242</p>
          <p className="text-muted-foreground text-sm">Expires 12/2025</p>
        </div>
      </div>
      
      <Button variant="outline" className="w-full">
        Update Payment Method
      </Button>
    </CardContent>
  </Card>
);

const BillingContactCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Billing Contact</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2 text-sm">
        <p className="font-medium">John Doe</p>
        <p className="text-muted-foreground">john@example.com</p>
        <p className="text-muted-foreground">
          123 Main St<br />
          San Francisco, CA 94105
        </p>
      </div>
      
      <Button variant="outline" className="w-full">
        Update Billing Info
      </Button>
    </CardContent>
  </Card>
);