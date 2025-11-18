import { Elysia } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";
import { messagesService } from "~/modules/messages/messages.service";
import {
  messageIdParams,
  messageInputModel,
  messageModel,
} from "./messages.schema";

// Main message router
export const messageRoutes = new Elysia({ prefix: "/messages" })
  .decorate("messagesService", messagesService)
  .model({
    message: messageModel,
    messageInput: messageInputModel,
    // message: messageModel,
    // messageResponse: messageResponseModel,
    // messageUpdate: messageUpdateModel,
    // messageIdParam: messageIdParam,
  })
  .onTransform(({ body, params, path, request: { method } }) => {
    console.log(`${method} ${path}`, {
      body,
      params,
    });
  })

  // Public routes
  .get(
    "/index",
    async ({ messagesService }) => {
      const messages = await messagesService.getAll();
      return { success: true, messages };
    },
    {
      // response: t.Object({
      // 	success: t.Boolean(),
      // 	messages: t.Array(messageResponseModel),
      // }),
      detail: {
        summary: "Get all messages",
        tags: ["Messages"],
      },
    },
  )

  // Authentication middleware
  .use(authMiddleware)
  .guard({
    auth: true,
  })

  // Protected routes
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
          message: "Message created successfully",
          result: message,
        };
      } catch (err) {
        console.error("[ERROR]", err);

        return status(500, {
          success: false,
          message:
            err instanceof Error ? err.message : "Failed to create message",
        });
      }
    },
    {
      auth: true,
      body: "message",
      // response: t.Object({
      // 	success: t.Boolean(),
      // 	message: t.String(),
      // 	result: messageResponseModel,
      // }),
      detail: {
        summary: "Create a new message",
        tags: ["Messages"],
        security: [{ BearerAuth: [] }],
      },
    },
  )

  // Routes that require a message ID
  .group("/:id", (app) =>
    app
      .get(
        "/",
        async ({ params, messagesService, status }) => {
          try {
            const message = await messagesService.getById({ id: params.id });

            if (!message) {
              return status(404, {
                success: false,
                message: "Message not found",
              });
            }

            return { success: true, message };
          } catch (err) {
            console.error("[ERROR]", err);

            return status(500, {
              success: false,
              message: err instanceof Error ? err.message : "An error occurred",
            });
          }
        },
        {
          params: messageIdParams,
          // response: t.Object({
          // 	success: t.Boolean(),
          // 	message: messageResponseModel,
          // }),
          detail: {
            summary: "Get a message by ID",
            tags: ["Messages"],
          },
        },
      )
      .patch(
        "/",
        async ({ params, body, messagesService, status, user }) => {
          try {
            // Validate ownership
            await messagesService.validateOwnership({
              id: params.id,
              userId: user.id,
            });

            // Update message
            const message = await messagesService.update({
              id: params.id,
              title: body.title,
              content: body.content,
            });

            return {
              success: true,
              message: "Message updated successfully",
              result: message,
            };
          } catch (err) {
            console.error("[ERROR]", err);

            if (err instanceof Error && err.message === "Message not found") {
              return status(404, {
                success: false,
                message: "Message not found",
              });
            }

            if (err instanceof Error && err.message === "Unauthorized") {
              return status(403, {
                success: false,
                message: "You are not authorized to update this message",
              });
            }

            return status(500, {
              success: false,
              message: err instanceof Error ? err.message : "An error occurred",
            });
          }
        },
        {
          auth: true,
          params: messageIdParams,
          body: "messageInput",
          // response: t.Object({
          //   success: t.Boolean(),
          //   message: t.String(),
          //   result: messageResponseModel,
          // }),
          detail: {
            summary: "Update a message",
            tags: ["Messages"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .delete(
        "/",
        async ({ params, messagesService, status, user }) => {
          try {
            // Validate ownership
            await messagesService.validateOwnership({
              id: params.id,
              userId: user.id,
            });

            // Delete message
            const result = await messagesService.delete({ id: params.id });

            return {
              success: true,
              message: "Message deleted successfully",
              result,
            };
          } catch (err) {
            console.error("[ERROR]", err);

            if (err instanceof Error && err.message === "Message not found") {
              return status(404, {
                success: false,
                message: "Message not found",
              });
            }

            if (err instanceof Error && err.message === "Unauthorized") {
              return status(403, {
                success: false,
                message: "You are not authorized to delete this message",
              });
            }

            return status(500, {
              success: false,
              message: err instanceof Error ? err.message : "An error occurred",
            });
          }
        },
        {
          auth: true,
          params: messageIdParams,
          // response: t.Object({
          // 	success: t.Boolean(),
          // 	message: t.String(),
          // 	result: t.Object({
          // 		success: t.Boolean(),
          // 	}),
          // }),
          detail: {
            summary: "Delete a message",
            tags: ["Messages"],
            security: [{ BearerAuth: [] }],
          },
        },
      ),
  );
