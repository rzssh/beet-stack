import { and, db, desc, eq } from "@beet/db";
import { message } from "@beet/db/schema";

export const messageRepository = {
  findManyByUser(userId: string) {
    return db.query.message.findMany({
      where: eq(message.userId, userId),
      orderBy: desc(message.createdAt),
      limit: 100,
    });
  },

  findByIdForUser(id: string, userId: string) {
    return db.query.message.findFirst({
      where: and(eq(message.id, id), eq(message.userId, userId)),
    });
  },

  async create(input: { title: string; content: string; userId: string }) {
    const [created] = await db.insert(message).values(input).returning();
    return created;
  },

  async updateForUser(
    id: string,
    userId: string,
    data: { title: string; content: string },
  ) {
    const [updated] = await db
      .update(message)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(message.id, id), eq(message.userId, userId)))
      .returning();
    return updated;
  },

  async deleteForUser(id: string, userId: string) {
    const [deleted] = await db
      .delete(message)
      .where(and(eq(message.id, id), eq(message.userId, userId)))
      .returning();
    return deleted;
  },
};

export type MessageRepository = typeof messageRepository;
