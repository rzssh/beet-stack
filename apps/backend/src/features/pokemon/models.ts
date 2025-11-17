import { t } from "elysia";

export const pokemonModel = t.Object(
	{
		id: t.Number(),
		name: t.String(),
	},
	{
		description: "Pokemon model",
	}
);

export const pokemonVoteModel = t.Object(
	{
		votedForId: t.Number(),
		votedAgainstId: t.Number(),
	},
	{
		description: "Pokemon vote model",
	}
);
