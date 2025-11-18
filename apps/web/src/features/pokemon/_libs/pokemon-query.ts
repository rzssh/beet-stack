import { queryOptions } from "@tanstack/react-query";
import { pokemonService } from "../_services/pokemon-service";

export const pokemonKeys = {
  all: ["pokemon"] as const,
  pair: () => [...pokemonKeys.all, "pair"] as const,
  results: () => [...pokemonKeys.all, "results"] as const,
};

export const pokemonPairQueryOptions = () => {
  return queryOptions({
    queryKey: pokemonKeys.pair(),
    queryFn: async () => {
      const pokemonPair = await pokemonService.getPokemonPair();
      return { pokemonPair };
    },
  });
};

export const pokemonResultsQueryOptions = () => {
  return queryOptions({
    queryKey: pokemonKeys.results(),
    queryFn: async () => {
      const results = await pokemonService.getPokemonResults();
      return { results };
    },
  });
};
