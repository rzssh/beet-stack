import { elysiaCountRepository } from "../_lib/count-elysia-api-repo";

class CountService {
  // Elysia implementation
  getElysiaCount = async (): Promise<number> => {
    const { count } = await elysiaCountRepository.getCount();
    return count;
  };

  incrementElysiaCount = async (): Promise<number> => {
    const { count } = await elysiaCountRepository.incrementCount();
    return count;
  };
}

export const countService = new CountService();
