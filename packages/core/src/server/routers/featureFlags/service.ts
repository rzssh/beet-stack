import { and, db, eq } from "@acme/db";
import * as schema from "@acme/db/schema";

export class FeatureFlagsService {
  async getAllGlobal() {
    return db.select().from(schema.featureFlag);
  }

  async getUserFlags(userId: string) {
    const globalFlags = await db.select().from(schema.featureFlag);
    const userOverrides = await db
      .select()
      .from(schema.userFeatureFlag)
      .where(eq(schema.userFeatureFlag.userId, userId));

    return globalFlags.map((flag) => {
      const override = userOverrides.find((uf) => uf.flagId === flag.id);
      return {
        ...flag,
        isEnabled: override ? override.isEnabled : flag.isEnabled,
        hasOverride: !!override,
      };
    });
  }

  async setUserFlag(userId: string, flagId: string, isEnabled: boolean) {
    const existing = await db
      .select()
      .from(schema.userFeatureFlag)
      .where(
        and(
          eq(schema.userFeatureFlag.userId, userId),
          eq(schema.userFeatureFlag.flagId, flagId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(schema.userFeatureFlag)
        .set({ isEnabled })
        .where(
          and(
            eq(schema.userFeatureFlag.userId, userId),
            eq(schema.userFeatureFlag.flagId, flagId),
          ),
        )
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(schema.userFeatureFlag)
      .values({ userId, flagId, isEnabled })
      .returning();
    return created;
  }

  async deleteUserFlag(userId: string, flagId: string) {
    await db
      .delete(schema.userFeatureFlag)
      .where(
        and(
          eq(schema.userFeatureFlag.userId, userId),
          eq(schema.userFeatureFlag.flagId, flagId),
        ),
      );
    return { success: true };
  }
}

export const featureFlagsService = new FeatureFlagsService();
