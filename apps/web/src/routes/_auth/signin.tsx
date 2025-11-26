import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
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
  type SocialSignInCredentials,
  socialSignInMutationOptions,
} from "~/lib/api/auth";
import { authToast } from "~/lib/auth-toast";
import { cn } from "~/lib/utils";

const REDIRECT_URL = "/dashboard";
export const Route = createFileRoute("/_auth/signin")({
  component: AuthPage,
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({ to: REDIRECT_URL });
    }
  },
});

const signinSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SigninValues = z.infer<typeof signinSchema>;

function SignInForm() {
  const router = useRouter();
  const { queryClient } = Route.useRouteContext();

  const form = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const signInMutation = useMutation({
    ...emailSignInMutationOptions,
    onSuccess: async () => {
      authToast.signInSuccess();
      window.location.href = REDIRECT_URL;
    },
    onError: (error) => {
      authToast.error(
        error instanceof Error ? error.message : "Failed to sign in",
      );
    },
  });

  const onSubmit = (values: SigninValues) => {
    const credentials: SignInCredentials = {
      email: values.email,
      password: values.password,
      callbackURL: REDIRECT_URL,
    };

    signInMutation.mutate(credentials);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled={signInMutation.isPending}
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
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
                  disabled={signInMutation.isPending}
                  type="password"
                  placeholder="********"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {signInMutation.isError && (
          <div className="font-medium text-destructive text-sm">
            {signInMutation.error instanceof Error
              ? signInMutation.error.message
              : "An error occurred during sign in"}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending ? "Signing in..." : "Sign in with email"}
        </Button>
      </form>
    </Form>
  );
}

function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border bg-card p-8">
        <div className="text-center">
          <h1 className="font-bold text-2xl">Sign in</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your credentials to sign in
          </p>
        </div>

        <SignInForm />

        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-1 border-t"></div>
          <div className="text-muted-foreground text-xs">OR CONTINUE WITH</div>
          <div className="flex-1 border-t"></div>
        </div>

        <div className="flex flex-col gap-2">
          <SignInButton
            provider="discord"
            label="Discord"
            className="bg-[#5865F2] hover:bg-[#5865F2]/80"
          />
          <SignInButton
            provider="github"
            label="GitHub"
            className="bg-neutral-700 hover:bg-neutral-700/80"
          />
          <SignInButton
            provider="google"
            label="Google"
            className="bg-[#DB4437] hover:bg-[#DB4437]/80"
          />
        </div>

        <div className="text-center text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

interface SignInButtonProps extends React.ComponentProps<typeof Button> {
  provider: "discord" | "google" | "github";
  label: string;
}

const SignInButton = ({
  provider,
  label,
  className,
  ...props
}: SignInButtonProps) => {
  const socialSignInMutation = useMutation({
    ...socialSignInMutationOptions,
    onSuccess: async (url) => {
      if (url) {
        window.location.href = url;
      }
    },
    onError: (error) => {
      authToast.error(
        error instanceof Error
          ? error.message
          : `Failed to sign in with ${label}`,
      );
    },
  });

  const handleSocialSignIn = () => {
    const credentials: SocialSignInCredentials = {
      provider,
      callbackURL: REDIRECT_URL,
    };
    socialSignInMutation.mutate(credentials);
  };

  return (
    <Button
      onClick={handleSocialSignIn}
      type="button"
      size="lg"
      disabled={socialSignInMutation.isPending}
      className={cn("text-white hover:text-white", className)}
      {...props}
    >
      {socialSignInMutation.isPending
        ? `Signing in with ${label}...`
        : `Sign in with ${label}`}
    </Button>
  );
};
