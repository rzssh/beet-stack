import { t } from "elysia";

export const pokemonVoteInput = t.Object({
  votedForId: t.Number(),
  votedAgainstId: t.Number(),
});
