import { Elysia, t } from "elysia";
import { createAttachMiddleware } from "~/server/middleware/attach";
import { featureFlagsService } from "./service";

export const featureFlagsRoutes = new Elysia({ prefix: "/flags" })
  .use(createAttachMiddleware())
  .decorate("featureFlagsService", featureFlagsService)
  .get(
    "/",
    async ({ featureFlagsService }) => {
      return featureFlagsService.getAllGlobal();
    },
    {
      detail: {
        summary: "Get all global feature flags",
        tags: ["Feature Flags"],
      },
    },
  )
  .guard({ auth: true }, (app) =>
    app
      .get(
        "/me",
        async ({ user, featureFlagsService }) => {
          return featureFlagsService.getUserFlags(user.id);
        },
        {
          detail: {
            summary: "Get feature flags for current user (with overrides)",
            tags: ["Feature Flags"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .post(
        "/me/:flagId",
        async ({ user, params, body, featureFlagsService }) => {
          return featureFlagsService.setUserFlag(
            user.id,
            params.flagId,
            body.isEnabled,
          );
        },
        {
          params: t.Object({
            flagId: t.String(),
          }),
          body: t.Object({
            isEnabled: t.Boolean(),
          }),
          detail: {
            summary: "Set feature flag override for current user",
            tags: ["Feature Flags"],
            security: [{ BearerAuth: [] }],
          },
        },
      )
      .delete(
        "/me/:flagId",
        async ({ user, params, featureFlagsService }) => {
          await featureFlagsService.deleteUserFlag(user.id, params.flagId);
          return { deleted: true };
        },
        {
          params: t.Object({
            flagId: t.String(),
          }),
          detail: {
            summary: "Remove feature flag override for current user",
            tags: ["Feature Flags"],
            security: [{ BearerAuth: [] }],
          },
        },
      ),
  );
