import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export const email = {
  send: async ({ to, subject, html, text, from = "noreply@yourdomain.com" }: EmailOptions) => {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      });

      if (error) {
        console.error("Email send error:", error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Email send error:", error);
      throw error;
    }
  },

  // Email templates
  templates: {
    welcome: ({ name, email: userEmail }: { name: string; email: string }) => ({
      subject: "Welcome to our platform!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome ${name}!</h1>
          <p>Thanks for signing up with ${userEmail}.</p>
          <p>We're excited to have you on board!</p>
        </div>
      `,
      text: `Welcome ${name}! Thanks for signing up with ${userEmail}. We're excited to have you on board!`,
    }),

    resetPassword: ({ name, resetUrl }: { name: string; resetUrl: string }) => ({
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reset Your Password</h1>
          <p>Hi ${name},</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
      text: `Hi ${name}, click this link to reset your password: ${resetUrl}. This link will expire in 24 hours.`,
    }),
  },
};

export type { EmailOptions };
