import { db } from "@acme/db/client";
import { message } from "@acme/db/schema";
import { eq } from "drizzle-orm";

type MessageWithUser = {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export const messageDb = {
  findAll: async () => {
    return db.query.message.findMany({
      with: { user: true },
    }) as Promise<MessageWithUser[]>;
  },

  findById: async (id: string) => {
    return db.query.message.findFirst({
      where: eq(message.id, id),
      with: { user: true },
    }) as Promise<MessageWithUser | undefined>;
  },

  create: async ({ title, content, userId }: { title: string; content: string; userId: string }) => {
    const result = await db
      .insert(message)
      .values({ title, content, userId })
      .returning()
      .then((res) => res[0]);

    if (!result) {
      throw new Error("Failed to create message");
    }

    return result;
  },

  update: async ({ id, title, content }: { id: string; title: string; content: string }) => {
    const result = await db
      .update(message)
      .set({ title, content, updatedAt: new Date() })
      .where(eq(message.id, id))
      .returning()
      .then((res) => res[0]);

    if (!result) {
      throw new Error("Failed to update message");
    }

    return result;
  },

  delete: async (id: string) => {
    const result = await db
      .delete(message)
      .where(eq(message.id, id))
      .returning()
      .then((res) => res[0]);

    if (!result) {
      throw new Error("Failed to delete message");
    }

    return result;
  },
};
