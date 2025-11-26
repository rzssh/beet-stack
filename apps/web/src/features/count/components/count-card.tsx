import { Link } from "@tanstack/react-router";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { countElysiaController } from "../controllers/count-elysia-controller";

interface CountCardProps {
  children?: React.ReactNode;
}

interface CountCardHeaderProps {
  title: string;
  description: string;
}

interface CountCardDisplayProps {
  count: number;
  description: string;
}

interface CountCardActionsProps {
  onIncrement: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  backTo?: string;
}

export function CountCard({ children }: CountCardProps) {
  const { data, isLoading, refetch } = countElysiaController.useCount();
  const { mutate: incrementCount, isPending } =
    countElysiaController.useIncrementCount();

  if (children) {
    return <Card className="w-full">{children}</Card>;
  }

  return (
    <Card className="w-full">
      <CountCard.Header
        title="Counter Demo"
        description="Elysia API + Eden Treaty integration"
      />
      <CountCard.Display count={data?.count ?? 0} description="Total count" />
      <CountCard.Actions
        onIncrement={() => incrementCount()}
        onRefresh={() => void refetch()}
        isLoading={isLoading || isPending}
      />
    </Card>
  );
}

CountCard.Header = function CountCardHeader({
  title,
  description,
}: CountCardHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
};

CountCard.Display = function CountCardDisplay({
  count,
  description,
}: CountCardDisplayProps) {
  return (
    <CardContent>
      <div className="text-center">
        <div className="mb-2 font-bold text-4xl text-primary">{count}</div>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  );
};

CountCard.Actions = function CountCardActions({
  onIncrement,
  onRefresh,
  isLoading,
  backTo,
}: CountCardActionsProps) {
  return (
    <CardContent className="pt-0">
      <div className="flex gap-2">
        <Button onClick={onIncrement} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Increment
        </Button>
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {backTo && (
        <Button variant="ghost" asChild className="mt-2 w-full">
          <Link to={backTo}>← Back to Dashboard</Link>
        </Button>
      )}
    </CardContent>
  );
};
