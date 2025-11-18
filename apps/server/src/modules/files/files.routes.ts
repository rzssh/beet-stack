import { Elysia, t } from "elysia";
import { authMiddleware } from "~/core/middleware/auth";
import { storage } from "~/lib/storage";

const presignInput = t.Object({
  filename: t.String(),
  contentType: t.Optional(t.String()),
});

export const fileRoutes = new Elysia({ prefix: "/files" })
  .use(authMiddleware)
  .guard({ auth: true }, (app) =>
    app.post(
      "/presign",
      async ({ body, user, set }) => {
        if (!storage.isConfigured) {
          set.status = 503;
          return {
            error:
              "S3 credentials are not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET.",
          };
        }

        try {
          const key = storage.utils.generateKey(body.filename, user.id);
          const presign = await storage.getPresignedUploadUrl({
            key,
            contentType: body.contentType,
          });

          return {
            url: presign.url,
            key: presign.key,
          };
        } catch (error) {
          set.status = 500;
          return {
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate upload URL",
          };
        }
      },
      {
        body: presignInput,
        detail: {
          summary: "Issue an S3 presigned upload URL",
          tags: ["Files"],
          security: [{ BearerAuth: [] }],
        },
      },
    ),
  );
