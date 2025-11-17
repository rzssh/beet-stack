import { Resend } from "resend";
import { env } from "../config/env";
import { logger } from "../observability/logger";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

const assertConfigured = () => {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }
};

const defaultFrom = "SaaS Starter <hello@acme.dev>";

export const email = {
  isConfigured: Boolean(resend),

  async send({ to, subject, html, text, from = defaultFrom }: EmailOptions) {
    assertConfigured();

    const response = await resend!.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (response.error) {
      logger.error("Email send error", response.error);
      throw new Error(`Failed to send email: ${response.error.message}`);
    }

    return response.data;
  },

  templates: {
    welcome: ({ name }: { name: string }) => ({
      subject: "Welcome to your new SaaS!",
      html: `
        <h1>Welcome ${name} 👋</h1>
        <p>You're moments away from shipping something amazing.</p>
        <p>Need help? Reply to this email and our team will be there.</p>
      `,
      text: `Welcome ${name}! Need help? Reply to this email and our team will be there.`,
    }),
    passwordReset: ({
      name,
      resetUrl,
    }: {
      name: string;
      resetUrl: string;
    }) => ({
      subject: "Reset your password",
      html: `
        <h1>Password reset requested</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password.</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
      text: `Hi ${name}, reset your password: ${resetUrl}`,
    }),
    teamInvite: ({
      inviter,
      inviteUrl,
      teamName,
    }: {
      inviter: string;
      inviteUrl: string;
      teamName: string;
    }) => ({
      subject: `${inviter} invited you to join ${teamName}`,
      html: `
        <h1>You're invited!</h1>
        <p>${inviter} invited you to collaborate on ${teamName}.</p>
        <p><a href="${inviteUrl}">Accept invite</a></p>
      `,
      text: `${inviter} invited you to join ${teamName}. Accept: ${inviteUrl}`,
    }),
  },
};

export type EmailClient = typeof email;
