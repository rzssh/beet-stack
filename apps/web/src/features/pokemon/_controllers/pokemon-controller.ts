/* eslint-disable react-hooks/rules-of-hooks */
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { queryClient } from "~/lib/tanstack-query/query-client";
import type { PokemonVoteParams } from "../_domain/pokemon-model";
import {
  pokemonKeys,
  pokemonPairQueryOptions,
  pokemonResultsQueryOptions,
} from "../_libs/pokemon-query";
import { pokemonService } from "../_services/pokemon-service";

// Atoms
const isPendingVoteAtom = atom(false);

class PokemonController {
  // Data fetchers for loaders/SSR
  getPokemonPair = () => {
    return queryClient.ensureQueryData(pokemonPairQueryOptions());
  };

  getPokemonResults = () => {
    return queryClient.ensureQueryData(pokemonResultsQueryOptions());
  };

	// Hooks for reading state
  useIsPendingVote = () => {
    const isPending = useAtomValue(isPendingVoteAtom);
    return { isPending };
  };

  usePokemonPair = () => {
    return useSuspenseQuery(pokemonPairQueryOptions()).data;
  };

  usePokemonResults = () => {
    return useSuspenseQuery(pokemonResultsQueryOptions()).data;
  };

	// Hooks for writing state
  useVoteForPokemon = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const setIsPending = useSetAtom(isPendingVoteAtom);

    const voteForPokemon = async ({
      votedForId,
      votedAgainstId,
    }: PokemonVoteParams): Promise<{ success: boolean }> => {
      try {
        setIsPending(true);
        await pokemonService.voteForPokemon({ votedForId, votedAgainstId });
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: pokemonKeys.pair(),
            type: "active",
          }),
          queryClient.refetchQueries({
            queryKey: pokemonKeys.results(),
            type: "active",
          }),
          router.invalidate(),
        ]);
        return { success: true };
      } finally {
        setIsPending(false);
      }
    };

    return { voteForPokemon };
  };
}

export const pokemonController = new PokemonController();
