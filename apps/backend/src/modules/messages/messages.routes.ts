import { email } from "@acme/platform";
import { Elysia } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";
import {
  messageIdParams,
  messageInputModel,
  messageModel,
} from "./messages.schema";
import { messagesService } from "./messages.service";

export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .model({
    message: messageModel,
    messageInput: messageInputModel,
    messageIdParams,
  })
  .guard({ auth: true }, (app) =>
    app
      .get("/", async ({ user }) => {
        const items = await messagesService.list(user.id);
        return { messages: items };
      })
      .post(
        "/",
        async ({ user, body }) => {
          const message = await messagesService.create(user.id, body);
          if (email.isConfigured && user.email) {
            void email.send({
              to: user.email,
              subject: "Message received",
              html: `<p>Hey ${user.name ?? "there"}, we saved your note "${message.title}".</p>`,
            });
          }
          return { message };
        },
        {
          body: "messageInput",
        },
      )
      .group("/:id", (group) =>
        group
          .get(
            "/",
            async ({ user, params, set }) => {
              try {
                const message = await messagesService.get(params.id, user.id);
                return { message };
              } catch (error) {
                if (
                  error instanceof Error &&
                  error.message === "Message not found"
                ) {
                  set.status = 404;
                  return { error: "Message not found" };
                }

                if (
                  error instanceof Error &&
                  error.message === "Unauthorized"
                ) {
                  set.status = 403;
                  return { error: "Unauthorized" };
                }

                throw error;
              }
            },
            {
              params: "messageIdParams",
            },
          )
          .patch(
            "/",
            async ({ user, params, body, set }) => {
              try {
                const message = await messagesService.update(
                  params.id,
                  user.id,
                  body,
                );
                return { message };
              } catch (error) {
                if (
                  error instanceof Error &&
                  error.message === "Message not found"
                ) {
                  set.status = 404;
                  return { error: "Message not found" };
                }
                if (
                  error instanceof Error &&
                  error.message === "Unauthorized"
                ) {
                  set.status = 403;
                  return { error: "Unauthorized" };
                }
                throw error;
              }
            },
            {
              params: "messageIdParams",
              body: "messageInput",
            },
          )
          .delete(
            "/",
            async ({ user, params, set }) => {
              try {
                await messagesService.remove(params.id, user.id);
                return { success: true };
              } catch (error) {
                if (
                  error instanceof Error &&
                  error.message === "Message not found"
                ) {
                  set.status = 404;
                  return { error: "Message not found" };
                }
                if (
                  error instanceof Error &&
                  error.message === "Unauthorized"
                ) {
                  set.status = 403;
                  return { error: "Unauthorized" };
                }
                throw error;
              }
            },
            {
              params: "messageIdParams",
            },
          ),
      ),
  );
