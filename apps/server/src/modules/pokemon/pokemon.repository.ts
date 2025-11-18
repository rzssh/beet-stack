import { db } from "@acme/db/client";
import * as schema from "@acme/db/schema";
import { desc, eq, inArray, or, sql } from "drizzle-orm";

export const pokemonRepository = {
  findManyByIds(ids: number[]) {
    return db
      .select({
        id: schema.pokemon.id,
        dexId: schema.pokemon.id,
        name: schema.pokemon.name,
      })
      .from(schema.pokemon)
      .where(inArray(schema.pokemon.id, ids));
  },

  async createVote(votedForId: number, votedAgainstId: number) {
    const res = await db
      .insert(schema.vote)
      .values({
        votedForId,
        votedAgainstId,
      })
      .returning();

    return res[0];
  },

  getResults() {
    return db
      .select({
        id: schema.pokemon.id,
        name: schema.pokemon.name,
        wins: sql<number>`count(distinct ${schema.vote.id}) filter (where ${schema.vote.votedForId} = ${schema.pokemon.id})`,
        losses: sql<number>`count(distinct ${schema.vote.id}) filter (where ${schema.vote.votedAgainstId} = ${schema.pokemon.id})`,
        winPercentage: sql<number>`
          case
            when (count(${schema.vote.id}) filter (where ${schema.vote.votedForId} = ${schema.pokemon.id} or ${schema.vote.votedAgainstId} = ${schema.pokemon.id})) = 0 then 0
            else CAST(count(${schema.vote.id}) filter (where ${schema.vote.votedForId} = ${schema.pokemon.id}) AS FLOAT) * 100.0 /
                 count(${schema.vote.id}) filter (where ${schema.vote.votedForId} = ${schema.pokemon.id} or ${schema.vote.votedAgainstId} = ${schema.pokemon.id})
          end
        `,
      })
      .from(schema.pokemon)
      .leftJoin(
        schema.vote,
        or(
          eq(schema.vote.votedForId, schema.pokemon.id),
          eq(schema.vote.votedAgainstId, schema.pokemon.id),
        ),
      )
      .groupBy(schema.pokemon.id, schema.pokemon.name)
      .orderBy(
        desc(
          sql`case
            when (count(${schema.vote.id}) filter (where ${schema.vote.votedForId} = ${schema.pokemon.id} or ${schema.vote.votedAgainstId} = ${schema.pokemon.id})) = 0 then 0
            else CAST(count(${schema.vote.id}) filter (where ${schema.vote.votedForId} = ${schema.pokemon.id}) AS FLOAT) * 100.0 /
                 count(${schema.vote.id}) filter (where ${schema.vote.votedForId} = ${schema.pokemon.id} or ${schema.vote.votedAgainstId} = ${schema.pokemon.id})
          end`,
        ),
        desc(
          sql`count(distinct ${schema.vote.id}) filter (where ${schema.vote.votedForId} = ${schema.pokemon.id})`,
        ),
      );
  },
};
