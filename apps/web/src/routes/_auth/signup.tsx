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
  emailSignUpMutationOptions,
  type SignUpCredentials,
} from "~/lib/api/auth";

const redirectUrl = "/messages";
const schema = z
  .object({
    name: z.string().min(2, "Name must have at least two characters"),
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must have at least eight characters"),
    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/_auth/signup")({
  component: SignupPage,
  beforeLoad: async ({ context }) => {
    if (context.user) throw redirect({ to: redirectUrl });
  },
});

function SignupPage() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const mutation = useMutation({
    ...emailSignUpMutationOptions,
    onSuccess: () => {
      window.location.href = redirectUrl;
    },
  });
  const submit = ({ confirmPassword: _, ...values }: Values) => {
    const credentials: SignUpCredentials = {
      ...values,
      callbackURL: redirectUrl,
    };
    mutation.mutate(credentials);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8">
        <div>
          <h1 className="font-bold text-2xl">Create account</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="space-y-4"
            autoComplete="on"
            method="post"
          >
            <AuthField
              form={form}
              name="name"
              label="Name"
              autoComplete="name"
            />
            <AuthField
              form={form}
              name="email"
              label="Email"
              type="email"
              autoComplete="username"
            />
            <AuthField
              form={form}
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
            />
            <AuthField
              form={form}
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
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
              {mutation.isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Form>
        <p className="text-sm">
          Already registered?{" "}
          <Link to="/signin" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

function AuthField({
  form,
  name,
  label,
  type = "text",
  autoComplete,
}: {
  form: ReturnType<typeof useForm<Values>>;
  name: keyof Values;
  label: string;
  type?: string;
  autoComplete: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} autoComplete={autoComplete} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
