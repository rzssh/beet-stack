import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { 
  Calendar, 
  LogOut, 
  Mail, 
  Shield, 
  User,
  UserCheck,
  Settings,
  Key,
} from "lucide-react";
import { Suspense } from "react";

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
import { serviceApi } from "~/lib/api";
import { authClient } from "~/lib/auth/client";

export const Route = createFileRoute("/_protected/profile")({
  component: ProfilePage,
  loader: async ({ context }) => {
    try {
      const response = await context.api().me.get();
      return { 
        initialUser: response.data,
        user: context.user
      };
    } catch {
      return { 
        initialUser: null,
        user: context.user
      };
    }
  },
});

function ProfilePage() {
  const { initialUser, user } = Route.useLoaderData();
  const router = useRouter();

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
                <BreadcrumbPage>Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-3xl tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account and authentication settings. This page demonstrates different auth flows.
            </p>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<UserProfileSkeleton />}>
              <UserProfileCard initialData={initialUser} />
            </Suspense>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-muted-foreground text-sm">
                      Receive notifications about your account activity
                    </p>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-muted-foreground text-sm">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Badge variant="outline">Not configured</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">API Access</h4>
                    <p className="text-muted-foreground text-sm">
                      Manage API keys and access tokens
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Key className="mr-2 h-4 w-4" />
                    Manage Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Current session and authentication state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Suspense fallback={<SessionSkeleton />}>
                  <SessionInfo />
                </Suspense>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={async () => {
                    await authClient.signOut();
                    await router.invalidate();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Patterns</CardTitle>
                <CardDescription>
                  Authentication and data fetching examples
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Server prefetch</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Client-side auth</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Session sync</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Auto-refresh</span>
                  <span className="text-green-600">✓</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const UserProfileCard = ({ initialData }: { initialData: any }) => {
  const { data: clientUser } = useQuery({
    queryKey: ["me", "client-side"],
    queryFn: async () => {
      const response = await serviceApi().me.get();
      return response.data;
    },
    initialData,
  });

  const userData = clientUser || initialData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Your account details and verification status. Data fetched server-side with client-side updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userData ? (
          <>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{userData.name || "No name set"}</h3>
                <p className="text-muted-foreground text-sm">Account holder</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userData.email}</span>
                {userData.emailVerified && (
                  <Badge variant="secondary" className="ml-auto">
                    <Shield className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {userData.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Member since {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Active account</span>
                <Badge variant="default" className="ml-auto">
                  Online
                </Badge>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            No profile data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SessionInfo = () => {
  const { data: session } = authClient.useSession();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm">Session active</span>
      </div>
      
      {session?.user && (
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">User ID:</span>
            <br />
            <span className="font-mono text-xs">{session.user.id}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Session expires:</span>
            <br />
            <span className="text-xs">
              {session.session?.expiresAt ? 
                new Date(session.session.expiresAt).toLocaleString() : 
                "Never"
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const UserProfileSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </CardContent>
  </Card>
);

const SessionSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
);