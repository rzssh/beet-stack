import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api, serviceApi } from "~/lib/api";

export const Route = createFileRoute("/count/")({
  loader: async () => {
    // Prefetch data from both sources to showcase both patterns
    try {
      const [integratedResponse, microserviceResponse] = await Promise.all([
        api()
          .count.get()
          .catch(() => ({ data: { count: 0 } })),
        Promise.resolve({ data: { count: 0 } }),
        // serviceApi().websock.get().catch(() => ({ data: { count: 0 } })),
      ]);

      return {
        integratedCount: integratedResponse.data?.count ?? 0,
        microserviceCount: microserviceResponse.data?.count ?? 0,
      };
    } catch {
      return { integratedCount: 0, microserviceCount: 0 };
    }
  },
  component: CountOverview,
});

function CountOverview() {
  const { integratedCount, microserviceCount } = Route.useLoaderData();
  const [counts, setCounts] = useState({
    integrated: integratedCount,
    microservice: microserviceCount,
  });
  const [loading, setLoading] = useState({
    integrated: false,
    microservice: false,
  });

  const handleIntegratedIncrement = async () => {
    setLoading((prev) => ({ ...prev, integrated: true }));
    try {
      const response = await api().count.post();
      setCounts((prev) => ({
        ...prev,
        integrated: response.data?.count ?? prev.integrated,
      }));
    } catch (error) {
      console.error("Integrated API error:", error);
    }
    setLoading((prev) => ({ ...prev, integrated: false }));
  };

  const handleMicroserviceIncrement = async () => {
    setLoading((prev) => ({ ...prev, microservice: true }));
    try {
      const response = await serviceApi().count.post();
      setCounts((prev) => ({
        ...prev,
        microservice: response.data?.count ?? prev.microservice,
      }));
    } catch (error) {
      console.error("Microservice API error:", error);
    }
    setLoading((prev) => ({ ...prev, microservice: false }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 font-bold text-3xl">API Pattern Showcase</h1>
        <p className="text-muted-foreground">
          Compare integrated vs microservice architecture patterns
        </p>
      </div>

      <Tabs defaultValue="integrated" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrated">Integrated API</TabsTrigger>
          <TabsTrigger value="microservice">Microservice API</TabsTrigger>
        </TabsList>

        <TabsContent value="integrated">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Integrated API Pattern</CardTitle>
                <Badge variant="secondary">Port 3000</Badge>
              </div>
              <CardDescription>
                TanStack Start with embedded Elysia routes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="mb-2 font-bold text-4xl text-primary">
                  {counts.integrated}
                </div>
                <p className="mb-4 text-muted-foreground text-sm">
                  Server-side: Direct function calls (no HTTP)
                  <br />
                  Client-side: HTTP via Eden Treaty
                </p>
              </div>
              <Button
                onClick={handleIntegratedIncrement}
                disabled={loading.integrated}
                className="w-full"
              >
                {loading.integrated ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Incrementing...
                  </>
                ) : (
                  "Increment Count"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="microservice">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Microservice API Pattern</CardTitle>
                <Badge variant="secondary">Port 3001</Badge>
              </div>
              <CardDescription>
                Separate Elysia server as microservice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="mb-2 font-bold text-4xl text-primary">
                  {counts.microservice}
                </div>
                <p className="mb-4 text-muted-foreground text-sm">
                  Always HTTP calls (even server-side)
                  <br />
                  True microservice architecture
                </p>
              </div>
              <Button
                onClick={handleMicroserviceIncrement}
                disabled={loading.microservice}
                className="w-full"
              >
                {loading.microservice ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Incrementing...
                  </>
                ) : (
                  "Increment Count"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">When to Use Integrated</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Simpler deployment (single app)</li>
              <li>• Better performance (no network hop on server)</li>
              <li>• Shared types without packages</li>
              <li>• Perfect for most applications</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">When to Use Microservice</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Independent scaling needs</li>
              <li>• Different deployment requirements</li>
              <li>• WebSockets or long-running processes</li>
              <li>• Multiple client applications</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
