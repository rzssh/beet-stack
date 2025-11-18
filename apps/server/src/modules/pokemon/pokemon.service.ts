import { pokemonRepository } from "./pokemon.repository";

const MAX_POKEMON = 1025;

const randomPair = () => {
  const first = Math.floor(Math.random() * MAX_POKEMON) + 1;
  let second = Math.floor(Math.random() * MAX_POKEMON) + 1;
  while (second === first) {
    second = Math.floor(Math.random() * MAX_POKEMON) + 1;
  }
  return [first, second] as const;
};

export class PokemonService {
  async getPair() {
    const [first, second] = randomPair();
    const result = await pokemonRepository.findManyByIds([first, second]);
    if (result.length < 2) {
      throw new Error("Failed to load pokemon pair");
    }
    return { pair: result };
  }

  async vote(votedForId: number, votedAgainstId: number) {
    if (votedForId === votedAgainstId) {
      throw new Error("Cannot vote for the same pokemon");
    }

    const vote = await pokemonRepository.createVote(votedForId, votedAgainstId);
    if (!vote) {
      throw new Error("Failed to record vote");
    }
    return vote;
  }

  getResults() {
    return pokemonRepository.getResults();
  }
}

export const pokemonService = new PokemonService();
