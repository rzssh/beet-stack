import { countRepository } from "./count.repository";

export class CountService {
  getCount() {
    return { count: countRepository.getCount() };
  }

  async increment() {
    const count = await countRepository.increment();
    return { count };
  }
}

export const countService = new CountService();
