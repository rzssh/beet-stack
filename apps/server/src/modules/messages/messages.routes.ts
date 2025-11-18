import { Elysia } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";
import { messagesService } from "~/modules/messages/messages.service";
import {
  messageIdParams,
  messageInputModel,
  messageModel,
} from "./messages.schema";

export const messageRoutes = new Elysia({ prefix: "/messages" })
  .decorate("messagesService", messagesService)
  .model({
    message: messageModel,
    messageInput: messageInputModel,
    messageIdParams,
  })
  .onTransform(({ body, params, path, request: { method } }) => {
    console.log(`${method} ${path}`, {
      body,
      params,
    });
  })
  .get(
    "/index",
    async ({ messagesService }) => {
      const messages = await messagesService.getAll();
      return { success: true, messages };
    },
    {
      detail: {
        summary: "Get all messages",
        tags: ["Messages"],
      },
    },
  )
  .use(authMiddleware)
  .guard({ auth: true }, (app) =>
    app
      .post(
        "/index",
        async ({ body, messagesService, status, user }) => {
          try {
            const message = await messagesService.create({
              title: body.title,
              content: body.content,
              userId: user.id,
            });

            return {
              success: true,
              message,
            };
          } catch (err) {
            console.error("[ERROR]", err);

            return status(500, {
              success: false,
              error:
                err instanceof Error ? err.message : "Failed to create message",
            });
          }
        },
        {
          body: "messageInput",
          detail: {
            summary: "Create a new message",
            tags: ["Messages"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .get(
        "/:id",
        async ({ params, messagesService, status }) => {
          try {
            const message = await messagesService.getById({ id: params.id });
            return { success: true, message };
          } catch (err) {
            console.error("[ERROR]", err);

            if (err instanceof Error && err.message === "Message not found") {
              return status(404, {
                success: false,
                error: err.message,
              });
            }

            return status(500, {
              success: false,
              error: err instanceof Error ? err.message : "An error occurred",
            });
          }
        },
        {
          params: messageIdParams,
          detail: {
            summary: "Get a message by ID",
            tags: ["Messages"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .patch(
        "/:id",
        async ({ params, body, messagesService, status, user }) => {
          try {
            await messagesService.validateOwnership({
              id: params.id,
              userId: user.id,
            });

            const message = await messagesService.update({
              id: params.id,
              title: body.title,
              content: body.content,
            });

            return {
              success: true,
              message,
            };
          } catch (err) {
            console.error("[ERROR]", err);

            if (err instanceof Error && err.message === "Message not found") {
              return status(404, {
                success: false,
                error: err.message,
              });
            }

            if (err instanceof Error && err.message === "Unauthorized") {
              return status(403, {
                success: false,
                error: err.message,
              });
            }

            return status(500, {
              success: false,
              error: err instanceof Error ? err.message : "An error occurred",
            });
          }
        },
        {
          params: messageIdParams,
          body: "messageInput",
          detail: {
            summary: "Update a message",
            tags: ["Messages"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .delete(
        "/:id",
        async ({ params, messagesService, status, user }) => {
          try {
            await messagesService.validateOwnership({
              id: params.id,
              userId: user.id,
            });

            await messagesService.delete({ id: params.id });

            return {
              success: true,
            };
          } catch (err) {
            console.error("[ERROR]", err);

            if (err instanceof Error && err.message === "Message not found") {
              return status(404, {
                success: false,
                error: err.message,
              });
            }

            if (err instanceof Error && err.message === "Unauthorized") {
              return status(403, {
                success: false,
                error: err.message,
              });
            }

            return status(500, {
              success: false,
              error: err instanceof Error ? err.message : "An error occurred",
            });
          }
        },
        {
          params: messageIdParams,
          detail: {
            summary: "Delete a message",
            tags: ["Messages"],
            security: [{ BearerAuth: [] }],
          },
        },
      ),
  );
