import { toast } from "sonner";

export const authToast = {
  signInSuccess: () => {
    toast.success("Successfully signed in", { description: "Welcome back!", duration: 4000 });
  },
  signUpSuccess: () => {
    toast.success("Account created successfully", { description: "Welcome to our platform!", duration: 5000 });
  },
  error: (message: string) => {
    toast.error("Authentication error", { description: message || "Something went wrong. Please try again.", duration: 5000 });
  },
  signOutSuccess: () => {
    toast.success("Successfully signed out", { duration: 3000 });
  },
  loading: (message: string) => {
    return toast.loading(message, { duration: 0 });
  },
  verificationEmailSent: (email: string) => {
    toast.success("Verification email sent", { description: `Please check ${email} to verify your account.`, duration: 8000 });
  },
};
