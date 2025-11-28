import { Elysia } from "elysia";
import { createAttachMiddleware } from "~/server/middleware/attach";
import {
  messageIdParams,
  messageInputModel,
  messageModel,
} from "~/server/schema/message";
import { messagesService } from "./service";

export const messagesRoutes = new Elysia({ prefix: "/messages" })
  .use(createAttachMiddleware())
  .decorate("messagesService", messagesService)
  .model({
    message: messageModel,
    messageInput: messageInputModel,
    messageIdParams,
  })
  .get("/", async ({ messagesService }) => messagesService.getAll())
  .get("/index", async ({ messagesService }) => messagesService.getAll())
  .guard({ auth: true }, (app) =>
    app
      .post(
        "/",
        async ({ body, messagesService, user, status }) => {
          const result = await messagesService.create({
            title: body.title,
            content: body.content,
            userId: user.id,
          });
          if ("error" in result) return status(500, { message: "Failed to create message" });
          return result.message;
        },
        { body: "messageInput" },
      )
      .post(
        "/index",
        async ({ body, messagesService, user, status }) => {
          const result = await messagesService.create({
            title: body.title,
            content: body.content,
            userId: user.id,
          });
          if ("error" in result) return status(500, { message: "Failed to create message" });
          return result.message;
        },
        { body: "messageInput" },
      )
      .get(
        "/:id",
        async ({ params, messagesService, status }) => {
          const message = await messagesService.getById({ id: params.id });
          if (!message) return status(400, { message: "Message not found" });
          return message;
        },
        { params: messageIdParams },
      )
      .patch(
        "/:id",
        async ({ params, body, messagesService, user, status }) => {
          const validation = await messagesService.validateOwnership({
            id: params.id,
            userId: user.id,
          });
          if ("error" in validation) {
            if (validation.error === "not_found") return status(400, { message: "Message not found" });
            if (validation.error === "not_authorized") return status(403, { message: "Not authorized" });
          }
          const message = await messagesService.update({
            id: params.id,
            title: body.title,
            content: body.content,
          });
          if (!message) return status(400, { message: "Failed to update message" });
          return message;
        },
        { params: messageIdParams, body: "messageInput" },
      )
      .delete(
        "/:id",
        async ({ params, messagesService, user, status }) => {
          const validation = await messagesService.validateOwnership({
            id: params.id,
            userId: user.id,
          });
          if ("error" in validation) {
            if (validation.error === "not_found") return status(400, { message: "Message not found" });
            if (validation.error === "not_authorized") return status(403, { message: "Not authorized" });
          }
          await messagesService.delete({ id: params.id });
          return { deleted: true };
        },
        { params: messageIdParams },
      ),
  );
