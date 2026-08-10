import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const message = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const messageRelations = relations(message, ({ one }) => ({
  user: one(user, { fields: [message.userId], references: [user.id] }),
}));

export const userRelations = relations(user, ({ many }) => ({
  messages: many(message),
}));

export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;
