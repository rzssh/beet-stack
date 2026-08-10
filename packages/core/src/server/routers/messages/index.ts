import { Elysia } from "elysia";
import { createAttachMiddleware } from "../../middleware/attach";
import {
  messageIdParams,
  messageInputModel,
  messageModel,
} from "../../schema/message";
import { type MessagesService, messagesService } from "./service";

export const createMessagesRoutes = (
  service: MessagesService = messagesService,
) =>
  new Elysia({ prefix: "/messages" })
    .use(createAttachMiddleware())
    .decorate("messagesService", service)
    .model({
      message: messageModel,
      messageInput: messageInputModel,
      messageIdParams,
    })
    .guard({ auth: true }, (app) =>
      app
        .get("/", ({ messagesService, user }) =>
          messagesService.list(user.id).then((messages) => ({ messages })),
        )
        .post(
          "/",
          ({ body, messagesService, user }) =>
            messagesService
              .create({ ...body, userId: user.id })
              .then((message) => ({ message })),
          { body: "messageInput" },
        )
        .get(
          "/:id",
          ({ params, messagesService, user }) =>
            messagesService
              .get(params.id, user.id)
              .then((message) => ({ message })),
          { params: "messageIdParams" },
        )
        .patch(
          "/:id",
          ({ params, body, messagesService, user }) =>
            messagesService
              .update(params.id, user.id, body)
              .then((message) => ({ message })),
          { params: "messageIdParams", body: "messageInput" },
        )
        .delete(
          "/:id",
          async ({ params, messagesService, user }) => {
            await messagesService.delete(params.id, user.id);
            return { deleted: true };
          },
          { params: "messageIdParams" },
        ),
    );

export const messagesRoutes = createMessagesRoutes();
