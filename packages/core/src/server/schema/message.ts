import { t } from "elysia";

export const messageModel = t.Object({
  id: t.String(),
  title: t.String(),
  content: t.String(),
  userId: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const messageInputModel = t.Object({
  title: t.String({ minLength: 1, maxLength: 100 }),
  content: t.String({ minLength: 1, maxLength: 1000 }),
});

export const messageIdParams = t.Object({
  id: t.String({ minLength: 1 }),
});
