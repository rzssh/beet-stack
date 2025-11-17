import { storage } from "@acme/platform";
import { Elysia, t } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";

const presignBody = t.Object({
  filename: t.String({ minLength: 1 }),
  contentType: t.Optional(t.String()),
});

export const fileRoutes = new Elysia({ prefix: "/files" })
  .use(authMiddleware)
  .guard(
    {
      auth: true,
    },
    (app) =>
      app.post(
        "/presign",
        async ({ user, body, set }) => {
          if (!storage.isConfigured) {
            set.status = 503;
            return {
              error: "Storage is not configured",
            };
          }

          const key = storage.utils.generateKey(body.filename, user.id);
          const url = await storage.getPresignedUploadUrl({
            key,
            contentType: body.contentType,
          });

          return url;
        },
        {
          body: presignBody,
        },
      ),
  );
