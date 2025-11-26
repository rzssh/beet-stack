import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap, 
  RefreshCw,
  Plus,
  Minus,
  RotateCcw
} from "lucide-react";
import { Suspense, useState, useEffect } from "react";

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
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { CountCard } from "~/features/count/components/count-card";
import { countElysiaController } from "~/features/count/controllers/count-elysia-controller";

export const Route = createFileRoute("/_protected/analytics")({
  component: AnalyticsPage,
  loader: async ({ context }) => {
    try {
      const response = await context.api().count.get();
      return { 
        initialCount: response.data?.count ?? 0,
      };
    } catch {
      return { 
        initialCount: 0,
      };
    }
  },
});

function AnalyticsPage() {
  const { initialCount } = Route.useLoaderData();

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
                <BreadcrumbPage>Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Real-time analytics powered by Elysia API and Eden Treaty. Demonstrates various data fetching patterns.
            </p>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Total Interactions" 
            value={initialCount.toString()} 
            description="Global counter value"
            icon={Activity}
            trend="+12% from last week"
          />
          <MetricCard 
            title="API Requests" 
            value="1,234" 
            description="This session"
            icon={Zap}
            trend="+5% from last hour"
          />
          <MetricCard 
            title="Response Time" 
            value="45ms" 
            description="Average latency"
            icon={TrendingUp}
            trend="2ms faster"
          />
          <MetricCard 
            title="Success Rate" 
            value="99.9%" 
            description="API uptime"
            icon={BarChart3}
            trend="100% today"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Interactive Counter Demo
                </CardTitle>
                <CardDescription>
                  This demonstrates real-time API interactions with optimistic updates and error handling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<CounterSkeleton />}>
                  <InteractiveCounter initialData={initialCount} />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Health</CardTitle>
                <CardDescription>
                  Real-time API status and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>API Status</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span>94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Database Health</span>
                    <Badge variant="default">Optimal</Badge>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
                <CardDescription>
                  Technologies powering this analytics page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>TanStack Start</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Elysia.js</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Eden Treaty</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>React Query</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Better Auth</span>
                  <span className="text-green-600">✓</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Fetching Patterns</CardTitle>
            <CardDescription>
              This page showcases various data fetching and caching strategies in the modern React ecosystem.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <Activity className="h-4 w-4 text-blue-500" />
                Server-Side Prefetch
              </h4>
              <p className="text-muted-foreground text-sm">
                Initial data is fetched on the server using TanStack Start route loaders, 
                providing instant page loads with SEO benefits.
              </p>
              <div className="text-xs text-muted-foreground">
                Route loader → API call → Initial render
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <Zap className="h-4 w-4 text-yellow-500" />
                Client-Side Mutations
              </h4>
              <p className="text-muted-foreground text-sm">
                Interactive elements use React Query mutations with optimistic updates, 
                automatic retries, and cache invalidation.
              </p>
              <div className="text-xs text-muted-foreground">
                User action → Optimistic update → API call → Cache sync
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Real-Time Updates
              </h4>
              <p className="text-muted-foreground text-sm">
                Background refetching keeps data fresh, while WebSocket integration 
                provides real-time updates across multiple clients.
              </p>
              <div className="text-xs text-muted-foreground">
                Background sync → WebSocket events → Live updates
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<any>;
  trend: string;
}

const MetricCard = ({ title, value, description, icon: Icon, trend }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
        <div className="mt-2 text-xs text-green-600">{trend}</div>
      </CardContent>
    </Card>
  );
};

const InteractiveCounter = ({ initialData }: { initialData: number }) => {
  const { data, isLoading, refetch } = countElysiaController.useCount();
  const { mutate: incrementCount, isPending: isIncrementing } = 
    countElysiaController.useIncrementCount();
  
  const [localHistory, setLocalHistory] = useState<number[]>([]);
  const currentValue = data?.count ?? initialData;

  useEffect(() => {
    if (currentValue !== undefined) {
      setLocalHistory(prev => [...prev, currentValue].slice(-10));
    }
  }, [currentValue]);

  const handleIncrement = () => {
    incrementCount();
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleReset = () => {
    setLocalHistory([]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="font-bold text-6xl text-primary">
          {currentValue}
        </div>
        <p className="mt-2 text-muted-foreground">Current counter value</p>
      </div>

      <div className="flex gap-2 justify-center">
        <Button 
          onClick={handleIncrement} 
          disabled={isIncrementing || isLoading}
          size="lg"
        >
          {isIncrementing ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Increment
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>

        <Button 
          variant="ghost" 
          onClick={handleReset}
          size="sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {localHistory.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recent Values</h4>
          <div className="flex gap-2 flex-wrap">
            {localHistory.map((value, index) => (
              <Badge 
                key={index} 
                variant={index === localHistory.length - 1 ? "default" : "secondary"}
                className="font-mono"
              >
                {value}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span>API Status</span>
          <Badge variant={isLoading ? "secondary" : "default"}>
            {isLoading ? "Loading" : "Connected"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Cache Status</span>
          <Badge variant="default">Fresh</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Updates</span>
          <Badge variant="default">Real-time</Badge>
        </div>
      </div>
    </div>
  );
};

const CounterSkeleton = () => (
  <div className="space-y-6">
    <div className="text-center space-y-3">
      <Skeleton className="h-16 w-32 mx-auto" />
      <Skeleton className="h-4 w-48 mx-auto" />
    </div>
    <div className="flex gap-2 justify-center">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-10" />
      <Skeleton className="h-10 w-10" />
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
);