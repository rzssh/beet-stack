import { db, schema } from "@acme/platform";
import { desc, eq } from "drizzle-orm";

export const messageRepository = {
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

  create: (input: { title: string; content: string; userId: string }) => {
    return db
      .insert(schema.message)
      .values(input)
      .returning()
      .then((res) => res[0]);
  },

  update: (id: string, data: { title: string; content: string }) => {
    return db
      .update(schema.message)
      .set({
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(schema.message.id, id))
      .returning()
      .then((res) => res[0]);
  },

  delete: (id: string) => {
    return db
      .delete(schema.message)
      .where(eq(schema.message.id, id))
      .returning()
      .then((res) => res[0]);
  },
};
