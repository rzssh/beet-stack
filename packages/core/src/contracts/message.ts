import { z } from "zod";

export const messageInputSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
});

export const messageIdSchema = z.object({
  id: z.string().min(1),
});

export type MessageInput = z.infer<typeof messageInputSchema>;
export type MessageId = z.infer<typeof messageIdSchema>;
