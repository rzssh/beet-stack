import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  emailSignInMutationOptions,
  type SignInCredentials,
} from "~/lib/api/auth";

const redirectUrl = "/messages";
const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/_auth/signin")({
  component: SignInPage,
  beforeLoad: async ({ context }) => {
    if (context.user) throw redirect({ to: redirectUrl });
  },
});

function SignInPage() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    ...emailSignInMutationOptions,
    onSuccess: () => {
      window.location.href = redirectUrl;
    },
  });
  const submit = (values: Values) => {
    const credentials: SignInCredentials = {
      ...values,
      callbackURL: redirectUrl,
    };
    mutation.mutate(credentials);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8">
        <div>
          <h1 className="font-bold text-2xl">Sign in</h1>
          <p className="text-muted-foreground">Use your local account.</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="space-y-4"
            autoComplete="on"
            method="post"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mutation.error && (
              <p className="text-destructive text-sm">
                {mutation.error.message}
              </p>
            )}
            <Button
              className="w-full"
              disabled={mutation.isPending}
              type="submit"
            >
              {mutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Form>
        <p className="text-sm">
          Need an account?{" "}
          <Link to="/signup" className="text-primary underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
