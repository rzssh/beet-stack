import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { 
  BarChart3,
  Calendar, 
  CreditCard,
  FileUp,
  LogOut, 
  Mail, 
  MessageSquare,
  Shield, 
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { Suspense, useEffect } from "react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { CountCard } from "~/features/count/components/count-card";
import { countElysiaController } from "~/features/count/controllers/count-elysia-controller";
import { serviceApi } from "~/lib/api";
import { authClient } from "~/lib/auth/client";

export const Route = createFileRoute("/_protected/dashboard/")({
  component: DashboardIndex,
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/signin" });
    }
  },
  loader: async ({ context }) => {
    const [authResponse, messagesResponse, countResponse] = await Promise.all([
      context.api().me.get(),
      context.api().messages.get(),
      context.api().count.get(),
    ]);

    // TODO: add client-side fetching examples
    // const { data: user } = useQuery({
    //   queryKey: ["me", "client-side"],
    //   queryFn: async () =>
    //     context
    //       .api()
    //       .me.get()
    //       .then((res) => res.data),
    // });
    return {
      user: context.user,
      initialMessages: messagesResponse.data?.messages ?? [],
      initialCount: countResponse.data?.count ?? 0,
    };
  },
});

function DashboardIndex() {
  const { user } = Route.useLoaderData();
  const router = useRouter();

  useEffect(() => {
    const ws = serviceApi().websocket.subscribe();

    ws.subscribe((message) => {
      console.log("got", message);
    });

    ws.on("open", () => {
      ws.send("hello from client");
    });

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  TanStack Start
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="font-semibold text-2xl">
            Welcome back, {user?.name ?? "User"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            This dashboard showcases the full stack: TanStack Start + Elysia + Better Auth + Eden Treaty.
            Explore different data fetching patterns and authentication flows.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <QuickStatsCard 
            title="Messages" 
            value="5" 
            description="Team messages"
            icon={MessageSquare}
            href="/messages"
          />
          <QuickStatsCard 
            title="Analytics" 
            value="1,234" 
            description="API requests"
            icon={BarChart3}
            href="/analytics"
          />
          <QuickStatsCard 
            title="Storage" 
            value="2.1 GB" 
            description="Files uploaded"
            icon={FileUp}
            href="/storage"
          />
          <QuickStatsCard 
            title="Team" 
            value="3" 
            description="Active users"
            icon={Users}
            href="/profile"
          />
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UserProfileCard user={user} router={router} />
          <CountPanel />
          <FeatureLinksCard />
        </section>

        <section className="space-y-4">
          <header>
            <h2 className="font-semibold text-lg">Recent Activity</h2>
            <p className="text-muted-foreground text-sm">
              Real-time updates via WebSocket and Eden Treaty integration.
            </p>
          </header>
          <Suspense fallback={<MessageSkeleton />}>
            <ActivityPanel />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

const CountPanel = () => {
  const { data, isLoading, refetch } = countElysiaController.useCount();
  const { mutate: incrementCount, isPending } =
    countElysiaController.useIncrementCount();

  return (
    <CountCard>
      <CountCard.Header
        title="Product heartbeat"
        description="Simple counter powered by the API + Eden Treaty"
      />
      <CountCard.Display
        count={data?.count ?? 0}
        description="Total button presses"
      />
      <CountCard.Actions
        onIncrement={() => incrementCount()}
        onRefresh={() => void refetch()}
        isLoading={isLoading || isPending}
        backTo="/dashboard"
      />
    </CountCard>
  );
};

interface QuickStatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
}

const QuickStatsCard = ({ title, value, description, icon: Icon, href }: QuickStatsCardProps) => {
  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        <p className="text-muted-foreground text-xs">{description}</p>
        <Button variant="link" className="mt-2 h-auto p-0" asChild>
          <Link to={href}>View details →</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const FeatureLinksCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Explore different features and data patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Manage Messages
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/billing">
            <CreditCard className="mr-2 h-4 w-4" />
            View Billing
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/storage">
            <FileUp className="mr-2 h-4 w-4" />
            Upload Files
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const ActivityPanel = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Activity</CardTitle>
          <CardDescription>
            WebSocket connection status and recent events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">WebSocket connected</span>
            </div>
            <div className="text-muted-foreground text-sm">
              Last activity: Just now
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/analytics">View Analytics →</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Fetching Patterns</CardTitle>
          <CardDescription>
            Server-side and client-side examples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Server prefetch</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Client queries</span>
              <span className="text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Real-time updates</span>
              <span className="text-green-600">✓</span>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Link to="/messages">View Examples</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MessageSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-2">
    <Skeleton className="h-80 w-full" />
    <div className="grid gap-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

const UserProfileCard = ({ user, router }: { user: any; router: any }) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Profile</CardTitle>
            <CardDescription>Account details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              {user.emailVerified && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Verified</span>
                </div>
              )}
              {user.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={async () => {
                await authClient.signOut();
                await router.invalidate();
              }}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            No user data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
