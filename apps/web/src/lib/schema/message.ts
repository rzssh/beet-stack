import { z } from "zod";

// Message validation schemas for forms and API
export const createMessageSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content too long"),
});

export const updateMessageSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content too long"),
});

export const messageIdSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Types
export type CreateMessage = z.infer<typeof createMessageSchema>;
export type UpdateMessage = z.infer<typeof updateMessageSchema>;
export type MessageId = z.infer<typeof messageIdSchema>;
