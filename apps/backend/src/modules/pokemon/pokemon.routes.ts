import { Elysia } from "elysia";
import { pokemonVoteInput } from "./pokemon.schema";
import { pokemonService } from "./pokemon.service";

export const pokemonRoutes = new Elysia({ prefix: "/pokemon" })
  .model({
    pokemonVoteInput,
  })
  .get("/pair", () => pokemonService.getPair())
  .post(
    "/vote",
    async ({ body, set }) => {
      try {
        const result = await pokemonService.vote(
          body.votedForId,
          body.votedAgainstId,
        );
        return { result };
      } catch (error) {
        if (error instanceof Error) {
          set.status = 400;
          return { error: error.message };
        }
        throw error;
      }
    },
    {
      body: "pokemonVoteInput",
    },
  )
  .get("/results", () => pokemonService.getResults());
