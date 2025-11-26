import { db, desc, eq } from "@acme/db";
import * as schema from "@acme/db/schema";

const DEFAULT_LIMIT = 100;

export const messageRepository = {
  findMany: () => {
    return db.query.message.findMany({
      orderBy: desc(schema.message.createdAt),
      limit: DEFAULT_LIMIT,
    });
  },

  findManyByUser: (userId: string) => {
    return db.query.message.findMany({
      where: eq(schema.message.userId, userId),
      orderBy: desc(schema.message.createdAt),
    });
  },

  findById: (id: string) => {
    return db.query.message.findFirst({
      where: eq(schema.message.id, id),
    });
  },

  create: async (input: { title: string; content: string; userId: string }) => {
    const res = await db.insert(schema.message).values(input).returning();

    return res[0];
  },

  update: async (id: string, data: { title: string; content: string }) => {
    const res = await db
      .update(schema.message)
      .set({
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(schema.message.id, id))
      .returning();

    return res[0];
  },

  delete: async (id: string) => {
    const res = await db
      .delete(schema.message)
      .where(eq(schema.message.id, id))
      .returning();

    return res[0];
  },
};
