import { api } from "@acme/api";
import type {
  PokemonPair,
  PokemonResult,
  PokemonVoteParams,
} from "../_domain/pokemon-model";
import type { PokemonRepository } from "../_domain/pokemon-repository";

class PokemonApiRepository implements PokemonRepository {
  getPokemonPair = async (): Promise<PokemonPair> => {
    const { data } = await api.pokemon.pair.get();
    const pair = data?.pair ?? [];
    if (pair.length < 2) {
      throw new Error("Failed to load pokemon pair");
    }

    return pair
      .slice(0, 2)
      .map((pokemon) => ({ id: pokemon.id, name: pokemon.name })) as PokemonPair;
  };

  voteForPokemon = async ({
    votedForId,
    votedAgainstId,
  }: PokemonVoteParams): Promise<void> => {
    await api.pokemon.vote.post({ votedForId, votedAgainstId });
  };

  getPokemonResults = async (): Promise<PokemonResult[]> => {
    const { data } = await api.pokemon.results.get();
    return (data ?? []).map((pokemon) => ({
      dexId: pokemon.id,
      name: pokemon.name,
      upVotes: pokemon.wins,
      downVotes: pokemon.losses,
      winPercentage: pokemon.winPercentage,
    }));
  };
}

export const pokemonApiRepository = new PokemonApiRepository();
