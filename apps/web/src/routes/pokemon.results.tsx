import { createFileRoute } from "@tanstack/react-router";
import { PokemonResultsList } from "src/features/pokemon/_components/pokemon-results-list";
import { pokemonController } from "src/features/pokemon/_controllers/pokemon-controller";
import { pokemonResultsQueryOptions } from "src/features/pokemon/_libs/pokemon-query";

export const Route = createFileRoute("/pokemon/results")({
	loader: ({ context }) => {
		return context.queryClient.ensureQueryData(pokemonResultsQueryOptions());
	},
	component: ResultsPage,
	head: () => ({
		meta: [
			{
				title: "Results (Tanstack Start + Drizzle + Bun Stack Version)",
			},
		],
	}),
});

function ResultsPage() {
	const { results } = pokemonController.usePokemonResults();

	return (
		<div className="container px-4 py-8 mx-auto text-white">
			<div className="grid gap-4">
				<PokemonResultsList results={results} />
			</div>
		</div>
	);
}
